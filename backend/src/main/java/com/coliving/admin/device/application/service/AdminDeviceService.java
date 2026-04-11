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

    // ── 기기 등록 (Create) ──

    @Override
    @Transactional
    public CreateAdminDeviceResult execute(CreateAdminDeviceCommand command) {
        if (command.macAddress() != null && !command.macAddress().isBlank()) {
            if (adminDeviceRepositoryPort.existsByMacAddress(command.macAddress())) {
                throw new BusinessException(ErrorCode.DUPLICATE_MAC_ADDRESS);
            }
        }

        if (command.deviceTypeId() != null) {
            validateDoorLockSpaceType(command.spaceId(), command.deviceTypeId());
        }

        // commands에서 초기 current_state 자동 생성
        String commandsJson = adminDeviceRepositoryPort.findDeviceTypeCommandsById(command.deviceTypeId());
        String initialState = DeviceStateUtil.buildInitialState(commandsJson);

        AdminDevice device = new AdminDevice(
                null,
                command.spaceId(),
                null, null,   // spaceName, spaceFloor — PersistenceAdapter에서 채움
                command.deviceTypeId(),
                null, null, null, // deviceTypeCode, Name, Commands — PersistenceAdapter에서 채움
                command.name(),
                command.modelName(),
                command.macAddress(),
                command.mockEndpoint(),
                "ONLINE",
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

        if (adminDeviceRepositoryPort.hasControlLogs(command.deviceId())) {
            throw new BusinessException(ErrorCode.CONTROL_LOG_EXISTS);
        }

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

        // 3. 기기 온라인 상태 검증
        if ("OFFLINE".equals(device.status()) || "ERROR".equals(device.status())) {
            throw new BusinessException(ErrorCode.DEVICE_OFFLINE);
        }

        // 4. MockIoT 제어 명령 전송
        boolean success = iotClient.sendCommand(
                command.deviceId(), command.command(), command.params());

        // 5. CONTROL_LOG 감사 이력 기록 (성공/실패 모두 기록)
        adminDeviceRepositoryPort.saveControlLog(
                command.deviceId(),
                command.userId(),
                "ADMIN",
                command.command(),
                command.params(),
                success ? "SUCCESS" : "FAILURE",
                success ? null : "IoT 통신 실패",
                command.correlationId()
        );

        if (!success) {
            // IoT 통신 실패 시 기기 상태를 자동으로 ERROR로 전환
            adminDeviceRepositoryPort.updateStatus(command.deviceId(), "ERROR");
            throw new BusinessException(ErrorCode.IOT_COMMUNICATION_FAIL);
        }

        // 6. 제어 성공 시 기기 current_state 업데이트 (기존 상태에 params 병합)
        String newState = DeviceStateUtil.mergeState(device.currentState(), command.params());
        adminDeviceRepositoryPort.updateCurrentState(command.deviceId(), newState);

        return new ControlAdminDeviceResult(
                command.deviceId(),
                command.command(),
                true,
                "기기 제어가 완료되었습니다"
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
