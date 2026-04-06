package com.coliving.resident.device_control.adapter.in.web.dto.res;

import com.coliving.resident.device_control.model.ResidentDevice;

import java.time.OffsetDateTime;

/**
 * 입주자 기기 응답 DTO
 */
public record ResidentDeviceResponseDto(
        Long deviceId,
        Long spaceId,
        String deviceTypeCode,
        String deviceTypeName,
        String uiType,
        String commands,
        String name,
        String modelName,
        String status,
        String currentState,
        Boolean isActive,
        OffsetDateTime lastOnlineAt
) {
    public static ResidentDeviceResponseDto from(ResidentDevice device) {
        return new ResidentDeviceResponseDto(
                device.deviceId(),
                device.spaceId(),
                device.deviceTypeCode(),
                device.deviceTypeName(),
                device.deviceTypeUiType(),
                device.deviceTypeCommands(),
                device.name(),
                device.modelName(),
                device.status(),
                device.currentState(),
                device.isActive(),
                device.lastOnlineAt()
        );
    }
}
