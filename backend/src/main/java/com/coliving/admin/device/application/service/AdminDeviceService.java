package com.coliving.admin.device.application.service;

import com.coliving.admin.device.application.command.CreateAdminDeviceCommand;
import com.coliving.admin.device.application.command.DeleteAdminDeviceCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceActiveCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceStatusCommand;
import com.coliving.admin.device.application.port.in.AdminDeviceUseCase;
import com.coliving.admin.device.application.port.in.CreateAdminDeviceUseCase;
import com.coliving.admin.device.application.port.out.AdminDeviceRepositoryPort;
import com.coliving.admin.device.application.result.CreateAdminDeviceResult;
import com.coliving.admin.device.model.AdminDevice;
import com.coliving.admin.device.model.DeviceStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDeviceService implements CreateAdminDeviceUseCase, AdminDeviceUseCase {

    private final AdminDeviceRepositoryPort adminDeviceRepositoryPort;

    // ── 기기 등록 (Create) ──

    @Override
    @Transactional
    public CreateAdminDeviceResult execute(CreateAdminDeviceCommand command) {
        // MAC 주소 중복 검증
        if (command.macAddress() != null && !command.macAddress().isBlank()) {
            if (adminDeviceRepositoryPort.existsByMacAddress(command.macAddress())) {
                throw new BusinessException(ErrorCode.DUPLICATE_MAC_ADDRESS);
            }
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

        // 상태값 유효성 검증
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

        // 활성 상태 기기 삭제 불가
        if (Boolean.TRUE.equals(device.isActive())) {
            throw new BusinessException(ErrorCode.DEVICE_ACTIVE);
        }

        // 제어 이력 있는 기기 삭제 불가
        if (adminDeviceRepositoryPort.hasControlLogs(command.deviceId())) {
            throw new BusinessException(ErrorCode.CONTROL_LOG_EXISTS);
        }

        adminDeviceRepositoryPort.softDelete(command.deviceId());
    }
}
