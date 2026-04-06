package com.coliving.admin.device.adapter.in.web.dto.req;

import com.coliving.admin.device.application.command.UpdateAdminDeviceStatusCommand;
import jakarta.validation.constraints.NotBlank;

public record UpdateAdminDeviceStatusRequestDto(
        @NotBlank(message = "상태값은 필수입니다")
        String status
) {
    public UpdateAdminDeviceStatusCommand toCommand(Long deviceId) {
        return new UpdateAdminDeviceStatusCommand(deviceId, status);
    }
}
