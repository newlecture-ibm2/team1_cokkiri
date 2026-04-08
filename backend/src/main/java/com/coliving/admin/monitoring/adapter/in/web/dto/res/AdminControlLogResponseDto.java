package com.coliving.admin.monitoring.adapter.in.web.dto.res;

import java.time.OffsetDateTime;

/**
 * 관리자 제어 이력 개별 로그 응답 DTO
 */
public record AdminControlLogResponseDto(
        Long controlLogId,
        Long deviceId,
        String deviceName,
        String deviceTypeName,
        String spaceName,
        Long userId,
        String userName,
        String actorType,
        String command,
        String commandParams,
        String result,
        String errorMessage,
        String correlationId,
        OffsetDateTime createdAt
) {
}
