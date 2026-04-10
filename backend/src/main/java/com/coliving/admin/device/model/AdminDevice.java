package com.coliving.admin.device.model;

import java.time.OffsetDateTime;

/**
 * 디바이스 도메인 모델 (순수 Java 객체)
 */
public record AdminDevice(
        Long deviceId,
        Long spaceId,
        String spaceName,
        Integer spaceFloor,
        Long deviceTypeId,
        String deviceTypeCode,
        String deviceTypeName,
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
}
