package com.coliving.resident.device_control.model;

import java.time.OffsetDateTime;

/**
 * 입주자 기기 도메인 모델
 * - spaceName, spaceType 추가 (RES-DEV-01: "표시: 공간구분, 공간명")
 */
public record ResidentDevice(
        Long deviceId,
        Long spaceId,
        String spaceName,
        String spaceType,
        Integer spaceFloor,
        String deviceTypeCode,
        String deviceTypeName,
        String deviceTypeUiType,
        String deviceTypeCommands,
        String name,
        String modelName,
        String mockEndpoint,
        String status,
        String currentState,
        Boolean isActive,
        OffsetDateTime lastOnlineAt
) {
}
