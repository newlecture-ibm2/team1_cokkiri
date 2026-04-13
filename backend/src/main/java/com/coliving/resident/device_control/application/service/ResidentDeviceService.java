package com.coliving.resident.device_control.application.service;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.infra.iot.DeviceStateUtil;
import com.coliving.infra.iot.IotClient;
import com.coliving.infra.iot.IotResponse;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    // 도메인 협업 룰 §4-1: 타 도메인 JpaRepository READ 전용 접근 허용
    private final ContractJpaRepository contractJpaRepository;

    /**
     * 내 기기 목록 조회 (RES-DEV-01) — 다중 계약 지원
     * - DB에서 ACTIVE 계약의 space_id 목록 조회
     * - 개인(PRIVATE): 모든 ACTIVE 계약의 space_id 기기 (is_active=true)
     * - 공용(COMMON): 전체 공용 기기
     * - CCTV 제외 (관리자 전용)
     */
    @Override
    @Transactional(readOnly = true)
    public List<ResidentDevice> getMyDevices(Long userId) {
        List<Long> spaceIds = findActiveSpaceIds(userId);

        if (spaceIds.isEmpty()) {
            throw new BusinessException(ErrorCode.NO_ACTIVE_CONTRACT);
        }

        List<ResidentDevice> result = new ArrayList<>();

        // 1. 모든 계약된 개인 공간 기기 조회
        for (Long spaceId : spaceIds) {
            result.addAll(residentDeviceRepositoryPort.findActiveDevicesBySpaceId(spaceId));
        }

        // 2. 공용 공간 기기 (CCTV 제외 — CCTV는 관리자 전용, ERD 비즈니스 규칙 #13)
        residentDeviceRepositoryPort.findActiveCommonDevices().stream()
                .filter(d -> !"CCTV".equals(d.deviceTypeCode()))
                .forEach(result::add);

        return result;
    }

    /**
     * 기기 제어 (RES-DEV-02) — 다중 계약 지원
     * 검증 순서:
     *   1. 기기 존재 확인
     *   2. ACTIVE 계약 space_id 목록 DB 조회 (다중 계약 지원)
     *   3. CCTV 관리자 전용 차단 (ERD 비즈니스 규칙 #13)
     *   4. 기기 활성화(isActive) 상태 검증
     *   5. 기기 온라인(ONLINE) 상태 검증
     *   6. DOOR_LOCK 방어 코드 (ERD 비즈니스 규칙 #14)
     *   7. 공간 타입별 접근 권한 검증
     *      - PRIVATE: 유저의 ACTIVE 계약 spaceIds에 기기 space_id 포함 확인
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

        // 2. ACTIVE 계약 space_id 목록 DB 조회 (다중 계약 지원)
        List<Long> spaceIds = findActiveSpaceIds(command.userId());
        if (spaceIds.isEmpty()) {
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

        // 7. 공간 타입별 접근 권한 검증 (다중 계약 지원)
        if ("PRIVATE".equals(spaceType)) {
            // PRIVATE 기기: 유저의 계약된 spaceIds에 기기 space_id 포함 여부 확인
            if (!spaceIds.contains(device.spaceId())) {
                throw new BusinessException(ErrorCode.SPACE_MISMATCH);
            }
        } else if ("COMMON".equals(spaceType)) {
            // COMMON 기기: 예약제 시설만 예약 검증 (자유이용 시설은 RESIDENT면 바로 허용)
            if (Boolean.TRUE.equals(device.isReservable())) {
                // 예약제 시설: 현재시각 APPROVED 예약 보유 확인 (ERD 비즈니스 규칙 #9)
                if (!residentDeviceRepositoryPort.hasApprovedReservationNow(command.userId(), device.spaceId())) {
                    throw new BusinessException(ErrorCode.NO_ACTIVE_RESERVATION);
                }
            }
            // 자유이용 시설(is_reservable=false): ACTIVE 계약만 있으면 제어 허용 (step 2에서 이미 검증)
        }

        // 8. MockIoT 제어 명령 전송
        IotResponse iotResult = iotClient.sendCommand(
                command.deviceId(), command.command(), command.params());

        // 9. CONTROL_LOG 감사 이력 기록 (성공/실패 모두 기록, RES-DEV-02 필수)
        residentDeviceRepositoryPort.saveControlLog(
                command.deviceId(),
                command.userId(),
                "RESIDENT",
                command.command(),
                command.params(),
                iotResult.result(),
                iotResult.success() ? null : iotResult.message(),
                command.correlationId()
        );

        if (!iotResult.success()) {
            // IoT 통신 실패 시 기기 상태를 자동으로 ERROR로 전환
            residentDeviceRepositoryPort.updateDeviceStatus(command.deviceId(), "ERROR");
            return new ControlDeviceResult(
                    command.deviceId(),
                    command.command(),
                    false,
                    iotResult.message() != null ? iotResult.message() : "IoT 기기 통신에 실패했습니다"
            );
        }

        // 10. 제어 성공 시 기기 current_state 업데이트
        String existingState = residentDeviceRepositoryPort.findCurrentState(command.deviceId());
        String newState;
        if (iotResult.state() != null && !iotResult.state().isEmpty()) {
            try {
                newState = new ObjectMapper().writeValueAsString(iotResult.state());
            } catch (JsonProcessingException e) {
                newState = DeviceStateUtil.mergeState(existingState, command.params());
            }
        } else {
            newState = DeviceStateUtil.mergeState(existingState, command.params());
        }
        residentDeviceRepositoryPort.updateCurrentState(command.deviceId(), newState);

        return new ControlDeviceResult(
                command.deviceId(),
                command.command(),
                true,
                "기기 제어가 완료되었습니다"
        );
    }

    /**
     * 해당 유저가 특정 공용 공간에 현재시각 기준 APPROVED 예약을 보유하고 있는지 확인
     */
    @Override
    @Transactional(readOnly = true)
    public boolean hasApprovedReservationNow(Long userId, Long spaceId) {
        return residentDeviceRepositoryPort.hasApprovedReservationNow(userId, spaceId);
    }

    // ── DB에서 ACTIVE 계약의 space_id 목록 조회 ──
    // 도메인 협업 룰 §4-1: 타 도메인 JpaRepository READ 전용 접근 허용
    private List<Long> findActiveSpaceIds(Long userId) {
        return contractJpaRepository.findByUserIdAndStatus(userId, ContractStatus.ACTIVE)
                .stream()
                .map(ContractEntity::getSpaceId)
                .toList();
    }
}
