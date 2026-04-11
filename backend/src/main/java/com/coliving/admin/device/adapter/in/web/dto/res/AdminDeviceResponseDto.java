package com.coliving.admin.device.adapter.in.web.dto.res;

import com.coliving.admin.device.model.AdminDevice;

import java.time.OffsetDateTime;

/**
 * 기기 목록/상세 응답 DTO
 */
public record AdminDeviceResponseDto(
        Long deviceId,
        Long spaceId,
        String spaceName,
        Integer spaceFloor,
        Long deviceTypeId,
        String deviceTypeCode,
        String deviceTypeName,
        String deviceTypeCommands,
        String name,
        String modelName,
        String macAddress,
        String mockEndpoint,
        String status,
        String currentState,
        Boolean isActive,
        OffsetDateTime installedAt,
        OffsetDateTime lastOnlineAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static AdminDeviceResponseDto from(AdminDevice device) {
        return new AdminDeviceResponseDto(
                device.deviceId(),
                device.spaceId(),
                device.spaceName(),
                device.spaceFloor(),
                device.deviceTypeId(),
                device.deviceTypeCode(),
                device.deviceTypeName(),
                device.deviceTypeCommands(),
                device.name(),
                device.modelName(),
                device.macAddress(),
                device.mockEndpoint(),
                device.status(),
                device.currentState(),
                device.isActive(),
                device.installedAt(),
                device.lastOnlineAt(),
                device.createdAt(),
                device.updatedAt()
        );
    }
}

