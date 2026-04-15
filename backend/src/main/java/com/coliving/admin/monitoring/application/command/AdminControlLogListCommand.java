package com.coliving.admin.monitoring.application.command;

import java.time.LocalDate;

/**
 * 관리자 제어 이력 목록 조회 필터 조건 (불변 객체)
 */
public record AdminControlLogListCommand(
        Long deviceId,
        Long userId,
        Long spaceId,
        Long deviceTypeId,
        String result,
        LocalDate startDate,
        LocalDate endDate,
        int page,
        int size
) {
}
