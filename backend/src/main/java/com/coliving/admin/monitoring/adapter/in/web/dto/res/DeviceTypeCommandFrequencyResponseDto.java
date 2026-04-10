package com.coliving.admin.monitoring.adapter.in.web.dto.res;

/**
 * 기기 종류 × 명령 교차 집계 응답 DTO
 */
public record DeviceTypeCommandFrequencyResponseDto(
        String deviceTypeName,
        String command,
        long count
) {}
