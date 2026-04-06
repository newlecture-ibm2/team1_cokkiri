package com.coliving.admin.device.application.command;

import jakarta.validation.constraints.NotNull;

/**
 * 기기 활성/비활성 토글 커맨드
 */
public record UpdateAdminDeviceActiveCommand(
        @NotNull(message = "기기 ID는 필수입니다")
        Long deviceId,

        @NotNull(message = "활성화 여부는 필수입니다")
        Boolean isActive
) {
}
