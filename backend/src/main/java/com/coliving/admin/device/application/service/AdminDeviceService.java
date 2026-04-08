package com.coliving.admin.device.application.service;

import com.coliving.admin.device.application.command.AdminDeviceListCommand;
import com.coliving.admin.device.application.command.ControlAdminDeviceCommand;
import com.coliving.admin.device.application.command.CreateAdminDeviceCommand;
import com.coliving.admin.device.application.command.DeleteAdminDeviceCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceActiveCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceStatusCommand;
import com.coliving.admin.device.application.port.in.AdminDeviceUseCase;
import com.coliving.admin.device.application.port.in.CreateAdminDeviceUseCase;
import com.coliving.admin.device.application.port.out.AdminDeviceRepositoryPort;
import com.coliving.admin.device.application.result.ControlAdminDeviceResult;
import com.coliving.admin.device.application.result.CreateAdminDeviceResult;
import com.coliving.admin.device.model.AdminDevice;
import com.coliving.admin.device.model.DeviceStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
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

        AdminDevice device = new AdminDevice(
                null,
                command.spaceId(),
                command.deviceTypeId(),
                null, null,
                command.name(),
                command.modelName(),
                command.macAddress(),
                command.mockEndpoint(),
                "OFFLINE", "{}",
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

    @Override
    @Transactional
    public AdminDevice updateActive(UpdateAdminDeviceActiveCommand command) {
        adminDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));

        adminDeviceRepositoryPort.updateActive(command.deviceId(), command.isActive());

        return adminDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }

    // ── 상태 변경 (ONLINE/OFFLINE/ERROR) ──

    @Override
    @Transactional
    public AdminDevice updateStatus(UpdateAdminDeviceStatusCommand command) {
        adminDeviceRepositoryPort.findById(command.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));

        try {
            DeviceStatus.valueOf(command.status());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "유효하지 않은 상태값입니다: " + command.status());
        }

        adminDeviceRepositoryPort.updateStatus(command.deviceId(), command.status());

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
            throw new BusinessException(ErrorCode.IOT_COMMUNICATION_FAIL);
        }

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
