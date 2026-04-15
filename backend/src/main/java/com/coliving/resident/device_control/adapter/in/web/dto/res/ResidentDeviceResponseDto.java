package com.coliving.resident.device_control.adapter.in.web.dto.res;

import com.coliving.resident.device_control.model.ResidentDevice;

import java.time.OffsetDateTime;

/**
 * 입주자 기기 응답 DTO
 * - spaceName, spaceType 추가 (RES-DEV-01 필수 표시 항목)
 * - controllable: 현재 제어 가능 여부 (PRIVATE=항상true, COMMON=예약시간대만true)
 */
public record ResidentDeviceResponseDto(
        Long deviceId,
        Long spaceId,
        String spaceName,
        String spaceType,
        Integer spaceFloor,
        String deviceTypeCode,
        String deviceTypeName,
        String uiType,
        String commands,
        String name,
        String modelName,
        String status,
        String currentState,
        Boolean isActive,
        OffsetDateTime lastOnlineAt,
        Boolean controllable
) {
    public static ResidentDeviceResponseDto from(ResidentDevice device, boolean controllable) {
        return new ResidentDeviceResponseDto(
                device.deviceId(),
                device.spaceId(),
                device.spaceName(),
                device.spaceType(),
                device.spaceFloor(),
                device.deviceTypeCode(),
                device.deviceTypeName(),
                device.deviceTypeUiType(),
                device.deviceTypeCommands(),
                device.name(),
                device.modelName(),
                device.status(),
                device.currentState(),
                device.isActive(),
                device.lastOnlineAt(),
                controllable
        );
    }
}
