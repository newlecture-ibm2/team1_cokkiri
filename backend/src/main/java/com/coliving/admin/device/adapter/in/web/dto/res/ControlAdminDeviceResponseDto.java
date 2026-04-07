package com.coliving.admin.device.adapter.in.web.dto.res;

import com.coliving.admin.device.application.result.ControlAdminDeviceResult;

/**
 * 관리자 기기 제어 응답 DTO (ADM-DEV-04)
 */
public record ControlAdminDeviceResponseDto(
        Long deviceId,
        String command,
        boolean success,
        String message
) {
    public static ControlAdminDeviceResponseDto from(ControlAdminDeviceResult result) {
        return new ControlAdminDeviceResponseDto(
                result.deviceId(),
                result.command(),
                result.success(),
                result.message()
        );
    }
}
