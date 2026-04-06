package com.coliving.admin.device.application.command;

import jakarta.validation.constraints.NotNull;

/**
 * 기기 삭제 커맨드
 */
public record DeleteAdminDeviceCommand(
        @NotNull(message = "기기 ID는 필수입니다")
        Long deviceId
) {
}
