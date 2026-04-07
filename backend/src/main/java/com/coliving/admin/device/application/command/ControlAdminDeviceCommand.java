package com.coliving.admin.device.application.command;

import java.util.Map;

/**
 * 관리자 기기 제어 명령 VO (ADM-DEV-04)
 * - ADMIN은 space_id 제한 없이 전체 접근 가능
 */
public record ControlAdminDeviceCommand(
        Long deviceId,
        Long userId,
        String command,
        Map<String, Object> params,
        String correlationId
) {
}
