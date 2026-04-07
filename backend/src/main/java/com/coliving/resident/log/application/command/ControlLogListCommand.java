package com.coliving.resident.log.application.command;

import java.time.LocalDate;

/**
 * 제어 이력 목록 조회 명령 VO (RES-LOG-01)
 * 필터: 기간, 공간구분, 기기종류, 결과
 */
public record ControlLogListCommand(
        Long userId,
        LocalDate startDate,
        LocalDate endDate,
        String spaceType,
        String deviceTypeCode,
        String result,
        int page,
        int size
) {
}
