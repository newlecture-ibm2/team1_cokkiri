package com.coliving.infra.iot;

import java.util.Map;

/**
 * IoT 기기 제어 응답 DTO
 *
 * <p>Mock IoT 서버가 반환한 응답 body를 파싱한 결과입니다.
 * 제어 성공 시 {@code state}에 IoT 기기의 최신 상태가 포함됩니다.</p>
 *
 * @param success  통신 성공 여부
 * @param deviceId 기기 ID
 * @param command  실행한 명령
 * @param result   결과 ("SUCCESS" / "FAILURE")
 * @param state    IoT가 반환한 최신 기기 상태 (실패 시 null)
 * @param message  결과 메시지
 */
public record IotResponse(
        boolean success,
        Long deviceId,
        String command,
        String result,
        Map<String, Object> state,
        String message
) {
    /**
     * 통신 실패 시 사용하는 팩토리 메서드
     */
    public static IotResponse failure(Long deviceId, String command, String message) {
        return new IotResponse(false, deviceId, command, "FAILURE", null, message);
    }
}
