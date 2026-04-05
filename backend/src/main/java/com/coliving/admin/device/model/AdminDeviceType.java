package com.coliving.admin.device.model;

import java.time.OffsetDateTime;

/**
 * 기기 종류 도메인 모델
 */
public record AdminDeviceType(
        Long deviceTypeId,
        String code,
        String name,
        String commands,
        String uiType,
        Boolean isSystemDefault,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
