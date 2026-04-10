package com.coliving.admin.device.application.command;

/**
 * 관리자 기기 목록 조회 필터 조건 (불변 객체)
 */
public record AdminDeviceListCommand(
        Long spaceId,
        Long deviceTypeId,
        String status,
        Boolean isActive,
        int page,
        int size
) {
}
