package com.coliving.admin.device.application.service;

import com.coliving.admin.device.application.command.AdminDeviceListCommand;
import com.coliving.admin.device.application.command.ControlAdminDeviceCommand;
import com.coliving.admin.device.application.command.CreateAdminDeviceCommand;
import com.coliving.admin.device.application.command.DeleteAdminDeviceCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceActiveCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceCommand;
import com.coliving.admin.device.application.port.in.AdminDeviceUseCase;
import com.coliving.admin.device.application.port.in.CreateAdminDeviceUseCase;
import com.coliving.admin.device.application.port.out.AdminDeviceRepositoryPort;
import com.coliving.admin.device.application.result.ControlAdminDeviceResult;
import com.coliving.admin.device.application.result.CreateAdminDeviceResult;
import com.coliving.admin.device.model.AdminDevice;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.infra.iot.DeviceStateUtil;
import com.coliving.infra.iot.IotClient;
import com.coliving.infra.iot.IotResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDeviceService implements CreateAdminDeviceUseCase, AdminDeviceUseCase {

    private final AdminDeviceRepositoryPort adminDeviceRepositoryPort;
    private final IotClient iotClient;

    // ── 기기 등록 (Create) — IoT 서버 조회 → DB INSERT ──

    @Override
    @Transactional
    public CreateAdminDeviceResult execute(CreateAdminDeviceCommand command) {
        // 1. MAC 주소 중복 검증
        if (adminDeviceRepositoryPort.existsByMacAddress(command.macAddress())) {
            throw new BusinessException(ErrorCode.DUPLICATE_MAC_ADDRESS);
        }

        // 2. 도어락 → PRIVATE 공간만 허용
        validateDoorLockSpaceType(command.spaceId(), command.deviceTypeId());

        // 3. IoT 서버에서 MAC으로 기기 정보 조회
        var iotDevice = iotClient.getDeviceByMac(command.macAddress());
        if (iotDevice == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "IoT 서버에서 해당 MAC 주소의 기기를 찾을 수 없습니다");
        }

        // 4. 초기 상태: 제어 이벤트 전까지 빈 객체
        //    current_state는 IoT 제어 응답으로만 채워지며, device_types.commands는 사용하지 않음
        String initialState = "{}";

        // 5. AdminDevice 생성
        //    - name: 관리자가 입력 (command.name())
        //    - modelName: IoT 서버에서 조회
        //    - mockEndpoint: 게이트웨이 IP (host)
        AdminDevice device = new AdminDevice(
                null,
                command.spaceId(),
                null, null,   // spaceName, spaceFloor — PersistenceAdapter에서 채움
                command.deviceTypeId(),
                null, null, null, // deviceTypeCode, Name, Commands — PersistenceAdapter에서 채움
                command.name(),            // 관리자가 부여한 이름
                iotDevice.modelName(),     // IoT 서버에서 조회
                command.macAddress(),      // 연결 키
                iotDevice.host(),          // 게이트웨이 IP → mock_endpoint에 저장
                iotDevice.status() != null ? iotDevice.status() : "ONLINE",
                initialState,
                true,
                null, null, null, null
        );

        AdminDevice saved = adminDeviceRepositoryPort.save(device);
        return CreateAdminDeviceResult.from(saved);
    }

    // ── 기기 목록 조회 (Read) ──

    @Override
    @Transactional(readOnly = true)
    public List<AdminDevice> getDeviceList() {
        return adminDeviceRepositoryPort.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminDevice> getDeviceList(AdminDeviceListCommand command) {
        return adminDeviceRepositoryPort.findAll(command);
    }

    // ── 기기 수정 (ADM-DEV-05) ──

    @Override
    @Transactional
    public AdminDevice updateDevice(UpdateAdminDeviceCommand command) {
        AdminDevice existing = adminDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));

        if (command.macAddress() != null && !command.macAddress().isBlank()) {
            if (adminDeviceRepositoryPort.existsByMacAddressAndDeviceIdNot(
                    command.macAddress(), command.deviceId())) {
                throw new BusinessException(ErrorCode.DUPLICATE_MAC_ADDRESS);
            }
        }

        if (!existing.spaceId().equals(command.spaceId())) {
            validateDoorLockSpaceType(command.spaceId(), existing.deviceTypeId());
        }

        return adminDeviceRepositoryPort.updateDevice(
                command.deviceId(), command.name(), command.spaceId(),
                command.modelName(), command.macAddress(), command.mockEndpoint());
    }

    // ── 활성/비활성 토글 (ADM-DEV-03) ──
    // 비활성화 → status=OFFLINE 자동 설정 / 재활성화 → status=ONLINE 복원

    @Override
    @Transactional
    public AdminDevice updateActive(UpdateAdminDeviceActiveCommand command) {
        adminDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));

        adminDeviceRepositoryPort.updateActive(command.deviceId(), command.isActive());

        // 비활성화 시 OFFLINE, 재활성화 시 ONLINE으로 자동 전환
        String newStatus = command.isActive() ? "ONLINE" : "OFFLINE";
        adminDeviceRepositoryPort.updateStatus(command.deviceId(), newStatus);

        return adminDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }

    // ── 기기 삭제 — Soft Delete (ADM-DEV-06) ──

    @Override
    @Transactional
    public void deleteDevice(DeleteAdminDeviceCommand command) {
        AdminDevice device = adminDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));

        if (Boolean.TRUE.equals(device.isActive())) {
            throw new BusinessException(ErrorCode.DEVICE_ACTIVE);
        }

        // Soft Delete: deleted_at 설정 — 제어 이력(control_logs)은 감사 목적으로 보존
        adminDeviceRepositoryPort.softDelete(command.deviceId());
    }

    /**
     * 기기 제어 (ADM-DEV-04)
     * RES-DEV-02와 동일 흐름이나 ADMIN은 space_id 제한 없이 전체 접근
     * CONTROL_LOG actor_type=ADMIN
     *
     * 검증 순서:
     *   1. 기기 존재 확인
     *   2. 기기 활성화(isActive) 상태 검증
     *   3. 기기 온라인(ONLINE) 상태 검증
     *   4. MockIoT 명령 전송
     *   5. CONTROL_LOG 감사 이력 기록 (성공/실패 모두)
     */
    @Override
    @Transactional
    public ControlAdminDeviceResult controlDevice(ControlAdminDeviceCommand command) {
        // 1. 기기 존재 확인
        AdminDevice device = adminDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));

        // 2. 기기 활성화 상태 검증
        if (!Boolean.TRUE.equals(device.isActive())) {
            throw new BusinessException(ErrorCode.DEVICE_INACTIVE);
        }

        // 3. 기기 온라인 상태 검증 — OFFLINE만 차단, ERROR는 관리자 재시도 허용
        if ("OFFLINE".equals(device.status())) {
            throw new BusinessException(ErrorCode.DEVICE_OFFLINE);
        }
        boolean wasError = "ERROR".equals(device.status());

        // 4. MockIoT 제어 명령 전송
        IotResponse iotResult = iotClient.sendCommand(
                command.deviceId(), command.command(), command.params());

        // 5. CONTROL_LOG 감사 이력 기록 (성공/실패 모두 기록)
        adminDeviceRepositoryPort.saveControlLog(
                command.deviceId(),
                command.userId(),
                "ADMIN",
                command.command(),
                command.params(),
                iotResult.result(),
                iotResult.success() ? null : iotResult.message(),
                command.correlationId()
        );

        if (!iotResult.success()) {
            // IoT 통신 실패 시 기기 상태를 자동으로 ERROR로 전환
            adminDeviceRepositoryPort.updateStatus(command.deviceId(), "ERROR");
            // 예외를 던지지 않고 실패 결과 반환 → 트랜잭션 커밋 (CONTROL_LOG + status 변경 보존)
            return new ControlAdminDeviceResult(
                    command.deviceId(),
                    command.command(),
                    false,
                    iotResult.message() != null ? iotResult.message() : "IoT 기기 통신에 실패했습니다"
            );
        }

        // 6. 제어 성공 시 기기 current_state 업데이트
        //    IoT 서버가 반환한 state가 있으면 그것으로 동기화, 없으면 기존 params 병합 방식 폴백
        String newState;
        if (iotResult.state() != null && !iotResult.state().isEmpty()) {
            try {
                newState = new ObjectMapper().writeValueAsString(iotResult.state());
            } catch (JsonProcessingException e) {
                log.warn("[IoT 상태 직렬화 실패] deviceId: {}, 기존 방식으로 폴백", command.deviceId(), e);
                newState = DeviceStateUtil.mergeState(device.currentState(), command.params());
            }
        } else {
            newState = DeviceStateUtil.mergeState(device.currentState(), command.params());
        }
        adminDeviceRepositoryPort.updateCurrentState(command.deviceId(), newState);

        // 7. ERROR 상태였던 기기가 제어 성공 시 → ONLINE 자동 복구
        if (wasError) {
            adminDeviceRepositoryPort.updateStatus(command.deviceId(), "ONLINE");
            log.info("[기기 복구] deviceId: {} — ERROR → ONLINE 자동 전환", command.deviceId());
        }

        return new ControlAdminDeviceResult(
                command.deviceId(),
                command.command(),
                true,
                wasError ? "기기가 복구되어 정상 작동합니다" : "기기 제어가 완료되었습니다"
        );
    }

    // ── DOOR_LOCK은 PRIVATE 공간에만 설치 가능 (ERD 비즈니스 규칙 #14) ──

    private void validateDoorLockSpaceType(Long spaceId, Long deviceTypeId) {
        String deviceTypeCode = adminDeviceRepositoryPort.findDeviceTypeCodeById(deviceTypeId);
        if (!"DOOR_LOCK".equals(deviceTypeCode)) {
            return;
        }

        String spaceType = adminDeviceRepositoryPort.findSpaceTypeById(spaceId);
        if (!"PRIVATE".equals(spaceType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "도어락(DOOR_LOCK)은 개인 공간(PRIVATE)에만 설치할 수 있습니다");
        }
    }
}
