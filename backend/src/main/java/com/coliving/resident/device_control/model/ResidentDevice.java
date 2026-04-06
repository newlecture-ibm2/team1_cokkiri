package com.coliving.resident.device_control.model;

import java.time.OffsetDateTime;

/**
 * 입주자 기기 도메인 모델
 */
public record ResidentDevice(
        Long deviceId,
        Long spaceId,
        String deviceTypeCode,
        String deviceTypeName,
        String deviceTypeUiType,
        String deviceTypeCommands,
        String name,
        String modelName,
        String status,
        String currentState,
        Boolean isActive,
        OffsetDateTime lastOnlineAt
) {
}
