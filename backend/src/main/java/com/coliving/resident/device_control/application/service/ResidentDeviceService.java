package com.coliving.resident.device_control.application.service;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.infra.iot.IotClient;
import com.coliving.resident.device_control.application.command.ControlDeviceCommand;
import com.coliving.resident.device_control.application.port.in.ResidentDeviceUseCase;
import com.coliving.resident.device_control.application.port.out.ResidentDeviceRepositoryPort;
import com.coliving.resident.device_control.application.result.ControlDeviceResult;
import com.coliving.resident.device_control.model.ResidentDevice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResidentDeviceService implements ResidentDeviceUseCase {

    private final ResidentDeviceRepositoryPort residentDeviceRepositoryPort;
    private final IotClient iotClient;

    /**
     * 내 기기 목록 조회 (RES-DEV-01)
     * - 개인(PRIVATE): space_id 기기 (is_active=true)
     * - 공용(COMMON): 전체 공용 기기 + 예약 여부 표시는 프론트에서 처리
     * - CCTV 제외 (관리자 전용)
     */
    @Override
    @Transactional(readOnly = true)
    public List<ResidentDevice> getMyDevices(Long spaceId) {
        if (spaceId == null) {
            throw new BusinessException(ErrorCode.NO_ACTIVE_CONTRACT);
        }

        List<ResidentDevice> result = new ArrayList<>();

        // 1. 개인 공간 기기
        result.addAll(residentDeviceRepositoryPort.findActiveDevicesBySpaceId(spaceId));

        // 2. 공용 공간 기기 (CCTV 제외 — CCTV는 관리자 전용, ERD 비즈니스 규칙 #13)
        residentDeviceRepositoryPort.findActiveCommonDevices().stream()
                .filter(d -> !"CCTV".equals(d.deviceTypeCode()))
                .forEach(result::add);

        return result;
    }

    /**
     * 기기 제어 (RES-DEV-02)
     * 검증 순서:
     *   1. 기기 존재 확인
     *   2. 계약 ACTIVE 여부 DB 재검증
     *   3. CCTV 관리자 전용 차단 (ERD 비즈니스 규칙 #13)
     *   4. 기기 활성화(isActive) 상태 검증
     *   5. 기기 온라인(ONLINE) 상태 검증
     *   6. DOOR_LOCK 방어 코드 (ERD 비즈니스 규칙 #14)
     *   7. 공간 타입별 접근 권한 검증
     *      - PRIVATE: JWT space_id와 기기 space_id 일치 확인
     *      - COMMON: 현재시각 APPROVED 예약 보유 확인 (ERD 비즈니스 규칙 #9)
     *   8. MockIoT 명령 전송
     *   9. CONTROL_LOG 감사 이력 기록 (성공/실패 모두)
     */
    @Override
    @Transactional
    public ControlDeviceResult controlDevice(ControlDeviceCommand command) {
        // 1. 기기 존재 확인
        ResidentDevice device = residentDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));

        // 2. 계약 ACTIVE 여부 DB 재검증
        //    (JWT 만료 전에 계약이 해지될 수 있으므로 DB 상태를 재확인)
        if (!residentDeviceRepositoryPort.hasActiveContract(command.userId())) {
            throw new BusinessException(ErrorCode.NO_ACTIVE_CONTRACT);
        }

        // 3. CCTV는 관리자 전용 (ERD 비즈니스 규칙 #13)
        if ("CCTV".equals(device.deviceTypeCode())) {
            throw new BusinessException(ErrorCode.CCTV_ADMIN_ONLY);
        }

        // 4. 기기 활성화 상태 검증
        if (!Boolean.TRUE.equals(device.isActive())) {
            throw new BusinessException(ErrorCode.DEVICE_INACTIVE);
        }

        // 5. 기기 온라인 상태 검증
        if ("OFFLINE".equals(device.status()) || "ERROR".equals(device.status())) {
            throw new BusinessException(ErrorCode.DEVICE_OFFLINE);
        }

        // 6. DOOR_LOCK 방어 코드 (ERD 비즈니스 규칙 #14: DOOR_LOCK=PRIVATE 전용)
        String spaceType = device.spaceType();
        if ("DOOR_LOCK".equals(device.deviceTypeCode()) && !"PRIVATE".equals(spaceType)) {
            throw new BusinessException(ErrorCode.SPACE_MISMATCH,
                    "도어락은 개인 공간에서만 제어할 수 있습니다");
        }

        // 7. 공간 타입별 접근 권한 검증
        if ("PRIVATE".equals(spaceType)) {
            // PRIVATE 기기: JWT space_id와 기기 설치 space_id 일치 확인
            if (!device.spaceId().equals(command.spaceId())) {
                throw new BusinessException(ErrorCode.SPACE_MISMATCH);
            }
        } else if ("COMMON".equals(spaceType)) {
            // COMMON 기기: 현재시각 APPROVED 예약 보유 확인 (ERD 비즈니스 규칙 #9)
            if (!residentDeviceRepositoryPort.hasApprovedReservationNow(command.userId(), device.spaceId())) {
                throw new BusinessException(ErrorCode.NO_ACTIVE_RESERVATION);
            }
        }

        // 8. MockIoT 제어 명령 전송
        boolean success = iotClient.sendCommand(
                command.deviceId(), command.command(), command.params());

        // 9. CONTROL_LOG 감사 이력 기록 (성공/실패 모두 기록, RES-DEV-02 필수)
        residentDeviceRepositoryPort.saveControlLog(
                command.deviceId(),
                command.userId(),
                "RESIDENT",
                command.command(),
                command.params(),
                success ? "SUCCESS" : "FAILURE",
                success ? null : "IoT 통신 실패",
                command.correlationId()
        );

        if (!success) {
            throw new BusinessException(ErrorCode.IOT_COMMUNICATION_FAIL);
        }

        // 10. 제어 성공 시 기기 current_state 업데이트
        String newState = buildCurrentState(command.command(), command.params());
        residentDeviceRepositoryPort.updateCurrentState(command.deviceId(), newState);

        return new ControlDeviceResult(
                command.deviceId(),
                command.command(),
                true,
                "기기 제어가 완료되었습니다"
        );
    }

    /**
     * 제어 명령에 따른 current_state JSON 생성
     */
    private String buildCurrentState(String command, Map<String, Object> params) {
        Map<String, Object> state = new java.util.HashMap<>();
        switch (command) {
            case "ON" -> state.put("power", "ON");
            case "OFF" -> state.put("power", "OFF");
            case "LOCK" -> state.put("power", "ON");
            case "UNLOCK" -> state.put("power", "OFF");
            case "START" -> state.put("power", "ON");
            case "STOP" -> state.put("power", "OFF");
            case "SET_TEMP" -> {
                state.put("power", "ON");
                if (params != null && params.containsKey("temperature")) {
                    state.put("temperature", params.get("temperature"));
                }
            }
            case "SET_BRIGHTNESS" -> {
                state.put("power", "ON");
                if (params != null && params.containsKey("brightness")) {
                    state.put("brightness", params.get("brightness"));
                }
            }
            case "SET_MODE" -> {
                state.put("power", "ON");
                if (params != null && params.containsKey("mode")) {
                    state.put("mode", params.get("mode"));
                }
            }
            default -> state.put("power", "ON");
        }
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(state);
        } catch (Exception e) {
            return "{\"power\":\"ON\"}";
        }
    }
}
