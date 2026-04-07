package com.coliving.resident.device_control.adapter.in.web.dto.res;

import com.coliving.resident.device_control.model.ResidentDevice;

import java.time.OffsetDateTime;

/**
 * 입주자 기기 응답 DTO
 * - spaceName, spaceType 추가 (RES-DEV-01 필수 표시 항목)
 */
public record ResidentDeviceResponseDto(
        Long deviceId,
        Long spaceId,
        String spaceName,
        String spaceType,
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
                device.spaceName(),
                device.spaceType(),
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
