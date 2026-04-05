package com.coliving.global.json;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

/**
 * multipart 폼 필드에 실린 JSON 배열(유지 첨부 등) 파싱. 비어 있으면 {@code null} (의미: 클라이언트가 필드 생략).
 */
public final class MultipartRetainedJsonParser {

    private MultipartRetainedJsonParser() {
    }

    public static <T> List<T> parseListOrNull(String json, ObjectMapper objectMapper, TypeReference<List<T>> type) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            List<T> list = objectMapper.readValue(json.strip(), type);
            return list != null ? list : List.of();
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
    }
}
