package com.coliving.resident.device_control.application.result;

/**
 * 기기 제어 결과 VO
 */
public record ControlDeviceResult(
        Long deviceId,
        String command,
        boolean success,
        String message
) {
}
