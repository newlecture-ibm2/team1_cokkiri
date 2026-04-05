package com.coliving.admin.device.adapter.out.persistence;

import com.coliving.admin.device.adapter.out.jpa.*;
import com.coliving.admin.device.application.port.out.AdminDeviceRepositoryPort;
import com.coliving.admin.device.model.AdminDevice;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminDevicePersistenceAdapter implements AdminDeviceRepositoryPort {

    private final DeviceJpaRepository deviceJpaRepository;
    private final DeviceTypeJpaRepository deviceTypeJpaRepository;

    @Override
    public AdminDevice save(AdminDevice device) {
        DeviceTypeEntity deviceType = deviceTypeJpaRepository.findById(device.deviceTypeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기 종류를 찾을 수 없습니다"));

        DeviceEntity entity;

        if (device.deviceId() != null) {
            // 수정
            entity = deviceJpaRepository.findById(device.deviceId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));
            entity.update(
                    device.name(),
                    device.modelName(),
                    device.macAddress(),
                    device.mockEndpoint(),
                    device.spaceId(),
                    deviceType
            );
        } else {
            // 신규 등록
            entity = DeviceEntity.builder()
                    .spaceId(device.spaceId())
                    .deviceType(deviceType)
                    .name(device.name())
                    .modelName(device.modelName())
                    .macAddress(device.macAddress())
                    .mockEndpoint(device.mockEndpoint())
                    .status(DeviceStatus.OFFLINE)
                    .currentState("{}")
                    .isActive(true)
                    .installedAt(OffsetDateTime.now())
                    .build();
        }

        DeviceEntity saved = deviceJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    public Optional<AdminDevice> findById(Long deviceId) {
        return deviceJpaRepository.findById(deviceId).map(this::toModel);
    }

    @Override
    public boolean existsByMacAddress(String macAddress) {
        return deviceJpaRepository.existsByMacAddress(macAddress);
    }

    @Override
    public boolean existsByMacAddressAndDeviceIdNot(String macAddress, Long deviceId) {
        return deviceJpaRepository.existsByMacAddressAndDeviceIdNot(macAddress, deviceId);
    }

    private AdminDevice toModel(DeviceEntity entity) {
        return new AdminDevice(
                entity.getDeviceId(),
                entity.getSpaceId(),
                entity.getDeviceType().getDeviceTypeId(),
                entity.getDeviceType().getCode(),
                entity.getDeviceType().getName(),
                entity.getName(),
                entity.getModelName(),
                entity.getMacAddress(),
                entity.getMockEndpoint(),
                entity.getStatus().name(),
                entity.getCurrentState(),
                entity.getIsActive(),
                entity.getInstalledAt(),
                entity.getLastOnlineAt(),
                entity.getCreatedAt()
        );
    }
}
