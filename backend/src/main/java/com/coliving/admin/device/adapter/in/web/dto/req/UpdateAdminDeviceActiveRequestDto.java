package com.coliving.admin.device.adapter.in.web.dto.req;

import com.coliving.admin.device.application.command.UpdateAdminDeviceActiveCommand;
import jakarta.validation.constraints.NotNull;

public record UpdateAdminDeviceActiveRequestDto(
        @NotNull(message = "활성화 여부는 필수입니다")
        Boolean isActive
) {
    public UpdateAdminDeviceActiveCommand toCommand(Long deviceId) {
        return new UpdateAdminDeviceActiveCommand(deviceId, isActive);
    }
}
