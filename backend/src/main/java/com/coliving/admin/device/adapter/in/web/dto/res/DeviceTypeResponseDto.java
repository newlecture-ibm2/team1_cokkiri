package com.coliving.admin.device.adapter.in.web.dto.res;

import com.coliving.admin.device.model.AdminDeviceType;

import java.time.OffsetDateTime;

public record DeviceTypeResponseDto(
        Long deviceTypeId,
        String code,
        String name,
        String commands,
        String uiType,
        Boolean isSystemDefault,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static DeviceTypeResponseDto from(AdminDeviceType model) {
        return new DeviceTypeResponseDto(
                model.deviceTypeId(),
                model.code(),
                model.name(),
                model.commands(),
                model.uiType(),
                model.isSystemDefault(),
                model.createdAt(),
                model.updatedAt()
        );
    }
}
