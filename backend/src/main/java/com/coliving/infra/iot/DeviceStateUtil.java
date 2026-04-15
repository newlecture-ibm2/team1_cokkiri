package com.coliving.infra.iot;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
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
     * device_types.commands JSON에서 초기 current_state를 자동 생성합니다.
     *
     * <p>각 command의 uiType에 따라 기본값을 결정합니다:
     * <ul>
     *   <li><b>toggle</b>: OFF 쪽 command의 stateValue (두 번째 항목 우선)</li>
     *   <li><b>slider</b>: min 값 (없으면 0)</li>
     *   <li><b>select</b>: options의 첫 번째 값</li>
     *   <li><b>button</b>: stateValue (있으면 적용)</li>
     * </ul>
     *
     * @param commandsJson device_types.commands JSON 문자열
     * @return 초기 current_state JSON 문자열
     */
    public static String buildInitialState(String commandsJson) {
        if (commandsJson == null || commandsJson.isBlank()) {
            return "{}";
        }

        Map<String, Object> initialState = new HashMap<>();

        try {
            JsonNode root = MAPPER.readTree(commandsJson);
            if (!root.isArray()) return "{}";

            // stateKey별 처음 만나는 값을 기본값으로 설정
            // toggle은 두 번째(OFF쪽)가 덮어쓰므로 자연스럽게 OFF 기본
            for (JsonNode cmd : root) {
                String stateKey = cmd.has("stateKey") ? cmd.get("stateKey").asText() : null;
                if (stateKey == null || stateKey.isBlank()) continue;

                String uiType = cmd.has("uiType") ? cmd.get("uiType").asText() : "toggle";

                switch (uiType) {
                    case "toggle" -> {
                        // stateValue가 있으면 적용 (배열 순서상 OFF가 뒤에 오면 최종적으로 OFF)
                        if (cmd.has("stateValue")) {
                            JsonNode sv = cmd.get("stateValue");
                            initialState.put(stateKey, nodeToValue(sv));
                        }
                    }
                    case "slider" -> {
                        int min = cmd.has("min") ? cmd.get("min").asInt(0) : 0;
                        initialState.putIfAbsent(stateKey, min);
                    }
                    case "select" -> {
                        if (cmd.has("options") && cmd.get("options").isArray() && !cmd.get("options").isEmpty()) {
                            initialState.putIfAbsent(stateKey, cmd.get("options").get(0).asText());
                        }
                    }
                    case "button" -> {
                        if (cmd.has("stateValue")) {
                            initialState.putIfAbsent(stateKey, nodeToValue(cmd.get("stateValue")));
                        }
                    }
                    default -> { /* 알 수 없는 uiType — 무시 */ }
                }
            }
        } catch (JsonProcessingException e) {
            log.warn("commands JSON 파싱 실패, 빈 초기 상태 반환: {}", commandsJson, e);
            return "{}";
        }

        return toJson(initialState);
    }

    /**
     * JsonNode를 적절한 Java 타입으로 변환합니다.
     */
    private static Object nodeToValue(JsonNode node) {
        if (node.isBoolean()) return node.asBoolean();
        if (node.isInt()) return node.asInt();
        if (node.isDouble()) return node.asDouble();
        return node.asText();
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
