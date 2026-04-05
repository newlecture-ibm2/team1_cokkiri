package com.coliving.admin.device.application.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 기기 상태(ONLINE/OFFLINE/ERROR) 변경 커맨드
 */
public record UpdateAdminDeviceStatusCommand(
        @NotNull(message = "기기 ID는 필수입니다")
        Long deviceId,

        @NotBlank(message = "상태값은 필수입니다")
        String status
) {
}
