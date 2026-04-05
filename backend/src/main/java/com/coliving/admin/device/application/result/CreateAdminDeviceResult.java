package com.coliving.admin.device.application.result;

import com.coliving.admin.device.model.AdminDevice;

import java.time.OffsetDateTime;

/**
 * 기기 등록/수정 결과 VO
 */
public record CreateAdminDeviceResult(
        Long deviceId,
        Long spaceId,
        Long deviceTypeId,
        String deviceTypeCode,
        String deviceTypeName,
        String name,
        String modelName,
        String macAddress,
        String mockEndpoint,
        String status,
        Boolean isActive,
        OffsetDateTime installedAt,
        OffsetDateTime createdAt
) {
    public static CreateAdminDeviceResult from(AdminDevice device) {
        return new CreateAdminDeviceResult(
                device.deviceId(),
                device.spaceId(),
                device.deviceTypeId(),
                device.deviceTypeCode(),
                device.deviceTypeName(),
                device.name(),
                device.modelName(),
                device.macAddress(),
                device.mockEndpoint(),
                device.status(),
                device.isActive(),
                device.installedAt(),
                device.createdAt()
        );
    }
}
