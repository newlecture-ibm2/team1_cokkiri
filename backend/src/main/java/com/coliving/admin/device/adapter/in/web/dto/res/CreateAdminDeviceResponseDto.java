package com.coliving.admin.device.adapter.in.web.dto.res;

import com.coliving.admin.device.application.result.CreateAdminDeviceResult;

import java.time.OffsetDateTime;

/**
 * 기기 등록 Response DTO
 */
public record CreateAdminDeviceResponseDto(
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
    public static CreateAdminDeviceResponseDto from(CreateAdminDeviceResult result) {
        return new CreateAdminDeviceResponseDto(
                result.deviceId(),
                result.spaceId(),
                result.deviceTypeId(),
                result.deviceTypeCode(),
                result.deviceTypeName(),
                result.name(),
                result.modelName(),
                result.macAddress(),
                result.mockEndpoint(),
                result.status(),
                result.isActive(),
                result.installedAt(),
                result.createdAt()
        );
    }
}
