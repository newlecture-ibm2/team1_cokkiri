package com.coliving.resident.device_control.application.command;

import java.util.Map;

/**
 * 기기 제어 명령 VO
 */
public record ControlDeviceCommand(
        Long deviceId,
        Long userId,
        Long spaceId,
        String command,
        Map<String, Object> params
) {
}
