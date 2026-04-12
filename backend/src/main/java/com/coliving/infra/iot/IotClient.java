package com.coliving.infra.iot;

import java.util.Map;

/**
 * IoT 기기 통신 추상 인터페이스 (OCP)
 *
 * 현재 구현체: {@link MockIotClient} (WireMock 기반 Mock 서버)
 * 추후 SmartThings 등 실제 IoT 벤더 연동 시 구현체만 교체하면 됩니다.
 */
public interface IotClient {

    /**
     * IoT 기기에 제어 명령을 전송합니다. (기본 엔드포인트 사용)
     *
     * @param deviceId 기기 ID
     * @param command  제어 명령 (예: "ON", "OFF", "SET_TEMP")
     * @param params   추가 파라미터
     * @return 통신 성공 여부
     */
    boolean sendCommand(Long deviceId, String command, Map<String, Object> params);

    /**
     * IoT 기기에 제어 명령을 전송합니다. (기기별 엔드포인트 지정)
     *
     * <p>기기 등록 시 설정한 mockEndpoint를 사용하여 다른 URL로 라우팅합니다.
     * endpoint가 null이거나 빈 문자열이면 기본 엔드포인트로 폴백합니다.</p>
     *
     * @param deviceId 기기 ID
     * @param command  제어 명령
     * @param params   추가 파라미터
     * @param endpoint 기기별 Mock IoT 엔드포인트 경로 (예: "/api/devices/control/error")
     * @return 통신 성공 여부
     */
    default boolean sendCommand(Long deviceId, String command, Map<String, Object> params, String endpoint) {
        return sendCommand(deviceId, command, params);
    }
}
