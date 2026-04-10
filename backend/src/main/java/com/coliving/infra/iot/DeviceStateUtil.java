package com.coliving.infra.iot;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * IoT 기기 current_state JSON 관리 유틸리티.
 *
 * 제어 명령의 params를 기존 상태에 **병합(merge)** 하여 갱신합니다.
 * - 기존 속성(temperature, mode 등)은 보존됩니다.
 * - params에 포함된 키만 추가/덮어쓰기 됩니다.
 * - params 값이 null인 키는 제거됩니다.
 *
 * <p>이 클래스를 사용함으로써 AdminDeviceService, ResidentDeviceService의
 * 하드코딩된 buildCurrentState() switch-case를 제거합니다.</p>
 */
@Slf4j
public final class DeviceStateUtil {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private DeviceStateUtil() {
        // 유틸리티 클래스 — 인스턴스화 금지
    }

    /**
     * 기존 current_state JSON에 제어 결과 params를 병합합니다.
     *
     * @param existingStateJson DB에 저장된 기존 current_state JSON 문자열
     * @param params            제어 명령 시 프론트엔드가 전송한 params (nullable)
     * @return 병합된 JSON 문자열
     */
    public static String mergeState(String existingStateJson, Map<String, Object> params) {
        Map<String, Object> state = parseJson(existingStateJson);

        if (params != null && !params.isEmpty()) {
            state.putAll(params);
            // null 값으로 전달된 키는 제거 (논리적 삭제)
            state.values().removeIf(Objects::isNull);
        }

        return toJson(state);
    }

    /**
     * JSON 문자열을 Map으로 파싱합니다. 파싱 실패 시 빈 Map 반환.
     */
    private static Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank() || "{}".equals(json.trim())) {
            return new HashMap<>();
        }
        try {
            return MAPPER.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.warn("current_state JSON 파싱 실패, 빈 상태로 초기화: {}", json, e);
            return new HashMap<>();
        }
    }

    /**
     * Map을 JSON 문자열로 직렬화합니다. 직렬화 실패 시 "{}" 반환.
     */
    private static String toJson(Map<String, Object> state) {
        try {
            return MAPPER.writeValueAsString(state);
        } catch (JsonProcessingException e) {
            log.warn("current_state JSON 직렬화 실패: {}", state, e);
            return "{}";
        }
    }
}
