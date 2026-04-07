package com.coliving.resident.log.model;

import java.time.OffsetDateTime;

/**
 * 기기 제어 이력 도메인 모델 (RES-LOG-01)
 * 표시: 일시, 공간구분, 공간명, 기기명, 종류, 명령, 결과, 상세
 */
public record ControlLog(
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
        String commandParams,
        String result,
        String errorMessage,
        String correlationId,
        OffsetDateTime createdAt
) {
}
