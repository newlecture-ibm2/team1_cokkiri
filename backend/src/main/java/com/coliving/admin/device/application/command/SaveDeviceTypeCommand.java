package com.coliving.admin.device.application.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 기기 종류 등록/수정 커맨드
 */
public record SaveDeviceTypeCommand(
        Long deviceTypeId,

        @NotBlank(message = "코드는 필수입니다")
        @Size(max = 50, message = "코드는 50자 이내여야 합니다")
        String code,

        @NotBlank(message = "이름은 필수입니다")
        @Size(max = 100, message = "이름은 100자 이내여야 합니다")
        String name,

        String commands,

        String uiType
) {
}
