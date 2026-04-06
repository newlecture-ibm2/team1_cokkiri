package com.coliving.admin.device.application.command;

/**
 * 기기 수정 Command (ADM-DEV-05)
 * deviceTypeId 미포함 — 기기종류 변경불가(삭제후 재등록)
 */
public record UpdateAdminDeviceCommand(
        Long deviceId,
        String name,
        Long spaceId,
        String modelName,
        String macAddress,
        String mockEndpoint
) {
}
