package com.coliving.resident.device_control.application.service;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.infra.iot.MockIotClient;
import com.coliving.resident.device_control.application.command.ControlDeviceCommand;
import com.coliving.resident.device_control.application.port.in.ResidentDeviceUseCase;
import com.coliving.resident.device_control.application.port.out.ResidentDeviceRepositoryPort;
import com.coliving.resident.device_control.application.result.ControlDeviceResult;
import com.coliving.resident.device_control.model.ResidentDevice;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidentDeviceService implements ResidentDeviceUseCase {

    private final ResidentDeviceRepositoryPort residentDeviceRepositoryPort;
    private final MockIotClient mockIotClient;

    /**
     * 내 기기 목록 조회 (RES-DEV-01)
     * - 개인(PRIVATE): space_id 기기 (is_active=true)
     * - 공용(COMMON): 전체 공용 기기 + 예약 여부 표시는 프론트에서 처리
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

        // 2. 공용 공간 기기 (CCTV 제외 — CCTV는 관리자 전용)
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
     *   3. CCTV 관리자 전용 차단
     *   4. 기기 활성화(isActive) 상태 검증
     *   5. 기기 온라인(ONLINE) 상태 검증
     *   6. 공간 타입별 접근 권한 검증
     *      - PRIVATE: JWT space_id와 기기 space_id 일치 확인
     *      - COMMON: 현재시각 APPROVED 예약 보유 확인 (ERD 비즈니스 규칙 #9)
     *   7. MockIoT 명령 전송
     */
    @Override
    @Transactional
    public ControlDeviceResult controlDevice(ControlDeviceCommand command) {
        // 1. 기기 존재 확인
        ResidentDevice device = residentDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));

        // 2. 계약 ACTIVE 여부 DB 재검증
        //    (JWT 만료 전에 계약이 해지될 수 있으므로 DB 상태를 재확인)
        //    ※ 크로스 도메인 접근: contracts 테이블 네이티브 쿼리 (룰 04 준수)
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

        // 6. 공간 타입별 접근 권한 검증
        String spaceType = residentDeviceRepositoryPort.findSpaceTypeById(device.spaceId());
        if ("PRIVATE".equals(spaceType)) {
            // PRIVATE 기기: JWT space_id와 기기 설치 space_id 일치 확인
            if (!device.spaceId().equals(command.spaceId())) {
                throw new BusinessException(ErrorCode.SPACE_MISMATCH);
            }
        } else if ("COMMON".equals(spaceType)) {
            // COMMON 기기: 현재시각 APPROVED 예약 보유 확인 (ERD 비즈니스 규칙 #9)
            //    ※ 크로스 도메인 접근: reservations 테이블 네이티브 쿼리 (룰 04 준수)
            if (!residentDeviceRepositoryPort.hasApprovedReservationNow(command.userId(), device.spaceId())) {
                throw new BusinessException(ErrorCode.NO_ACTIVE_RESERVATION);
            }
        }

        // 7. MockIoT 제어 명령 전송
        boolean success = mockIotClient.sendCommand(
                command.deviceId(), command.command(), command.params());

        if (!success) {
            throw new BusinessException(ErrorCode.IOT_COMMUNICATION_FAIL);
        }

        return new ControlDeviceResult(
                command.deviceId(),
                command.command(),
                true,
                "기기 제어가 완료되었습니다"
        );
    }
}
