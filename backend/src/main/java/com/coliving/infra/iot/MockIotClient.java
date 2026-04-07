package com.coliving.infra.iot;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
public class MockIotClient {

    private static final Duration IOT_TIMEOUT = Duration.ofSeconds(5);

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public MockIotClient(@Value("${mock-iot.base-url}") String baseUrl,
                         RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(IOT_TIMEOUT)
                .setReadTimeout(IOT_TIMEOUT)
                .build();
        this.baseUrl = baseUrl;
    }

    /**
     * IoT 기기에 제어 명령을 전송합니다.
     *
     * @param deviceId 기기 ID
     * @param command  제어 명령 (예: "ON", "OFF", "SET_TEMP")
     * @param params   추가 파라미터
     * @return 통신 성공 여부
     */
    public boolean sendCommand(Long deviceId, String command, Map<String, Object> params) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "device_id", deviceId,
                    "command", command,
                    "params", params != null ? params : Map.of()
            );

            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/api/devices/control",
                    requestBody,
                    String.class
            );

            boolean success = response.getStatusCode().is2xxSuccessful();
            log.info("IoT 기기 제어 요청 - deviceId: {}, command: {}, success: {}", deviceId, command, success);
            return success;
        } catch (RestClientException e) {
            log.error("IoT 기기 통신 실패 - deviceId: {}, command: {}", deviceId, command, e);
            return false;
        }
    }
}
