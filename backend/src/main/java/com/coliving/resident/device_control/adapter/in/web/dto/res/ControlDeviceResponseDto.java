package com.coliving.resident.device_control.adapter.in.web.dto.res;

import com.coliving.resident.device_control.application.result.ControlDeviceResult;

/**
 * 기기 제어 응답 DTO
 */
public record ControlDeviceResponseDto(
        Long deviceId,
        String command,
        boolean success,
        String message
) {
    public static ControlDeviceResponseDto from(ControlDeviceResult result) {
        return new ControlDeviceResponseDto(
                result.deviceId(),
                result.command(),
                result.success(),
                result.message()
        );
    }
}
