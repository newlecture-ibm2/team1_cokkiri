package com.coliving.admin.monitoring.adapter.in.web.dto.res;

/**
 * 기기별 제어 성공률 응답 DTO
 * 최근 30일 기준
 */
public record DeviceAvailabilityResponseDto(
        Long deviceId,
        String deviceName,
        String deviceTypeName,
        String spaceName,
        Integer floor,
        long totalCount,
        long successCount,
        long failureCount,
        double successRate
) {}
