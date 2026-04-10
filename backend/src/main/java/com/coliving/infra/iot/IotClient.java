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
     * IoT 기기에 제어 명령을 전송합니다.
     *
     * @param deviceId 기기 ID
     * @param command  제어 명령 (예: "ON", "OFF", "SET_TEMP")
     * @param params   추가 파라미터
     * @return 통신 성공 여부
     */
    boolean sendCommand(Long deviceId, String command, Map<String, Object> params);
}
