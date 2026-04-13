package com.coliving.resident.device_control.application.command;

import java.util.Map;

/**
 * 기기 제어 명령 VO
 * - spaceId/spaceIds 없음: Service에서 DB 조회하여 검증 (§1-9 #4 준수)
 */
public record ControlDeviceCommand(
        Long deviceId,
        Long userId,
        String command,
        Map<String, Object> params,
        String correlationId
) {
}
