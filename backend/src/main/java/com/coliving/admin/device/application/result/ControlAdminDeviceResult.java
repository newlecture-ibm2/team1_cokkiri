package com.coliving.admin.device.application.result;

/**
 * 관리자 기기 제어 결과 VO (ADM-DEV-04)
 */
public record ControlAdminDeviceResult(
        Long deviceId,
        String command,
        boolean success,
        String message
) {
}
