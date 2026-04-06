package com.coliving.admin.device.adapter.in.web.dto.req;

import com.coliving.admin.device.application.command.SaveDeviceTypeCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaveDeviceTypeRequestDto(
        @NotBlank(message = "코드는 필수입니다")
        @Size(max = 50, message = "코드는 50자 이내여야 합니다")
        String code,

        @NotBlank(message = "이름은 필수입니다")
        @Size(max = 100, message = "이름은 100자 이내여야 합니다")
        String name,

        String commands,

        String uiType
) {
    public SaveDeviceTypeCommand toCommand(Long deviceTypeId) {
        return new SaveDeviceTypeCommand(deviceTypeId, code, name, commands, uiType);
    }
}
