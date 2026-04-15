package com.coliving.resident.log.adapter.in.web.dto;

import com.coliving.resident.log.model.ControlLog;

import java.time.OffsetDateTime;

/**
 * 제어 이력 응답 DTO (RES-LOG-01)
 * 조회 전용이므로 dto/ 플랫 구조 사용 (03-backend-architecture §1-3-1)
 */
public record ControlLogResponseDto(
        Long controlLogId,
        Long deviceId,
        String deviceName,
        String deviceTypeCode,
        String deviceTypeName,
        Long spaceId,
        String spaceName,
        String spaceType,
        String actorType,
        String command,
        String commandLabel,
        String commandParams,
        String result,
        String errorMessage,
        OffsetDateTime createdAt
) {
    public static ControlLogResponseDto from(ControlLog model) {
        if (model == null) return null;
        return new ControlLogResponseDto(
                model.controlLogId(),
                model.deviceId(),
                model.deviceName(),
                model.deviceTypeCode(),
                model.deviceTypeName(),
                model.spaceId(),
                model.spaceName(),
                model.spaceType(),
                model.actorType(),
                model.command(),
                model.commandLabel(),
                model.commandParams(),
                model.result(),
                model.errorMessage(),
                model.createdAt()
        );
    }
}
