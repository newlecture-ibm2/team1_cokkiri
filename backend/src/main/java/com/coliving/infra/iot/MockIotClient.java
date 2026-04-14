package com.coliving.infra.iot;

import com.coliving.admin.device.adapter.out.jpa.DeviceEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;


import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Custom Mock IoT 서버 통신 클라이언트 (WebClient 기반)
 *
 * <h3>스레드 격리 전략</h3>
 * IoT 통신은 전용 스레드풀(iot-worker-*)에서 실행되어,
 * Mock IoT 서버가 지연되어도 톰캣 메인 스레드에 영향을 주지 않습니다.
 *
 * <h3>안전장치</h3>
 * <ul>
 *   <li>Connection Timeout: 2초</li>
 *   <li>Response Timeout: 5초 (coliving-plan.md §3)</li>
 *   <li>Retry: 없음 (재시도는 사용자가 직접 수행)</li>
 *   <li>Fallback: 통신 실패 시 IotResponse.failure() 반환 + 구체적 로그</li>
 * </ul>
 */
@Slf4j
@Component
public class MockIotClient implements IotClient {

    private static final Duration GLOBAL_TIMEOUT = Duration.ofSeconds(6);

    private static final String CONTROL_ENDPOINT = "/api/devices/control";
    private static final String DEVICES_ENDPOINT = "/api/devices";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final WebClient webClient;
    private final Executor iotTaskExecutor;
    private final DeviceJpaRepository deviceJpaRepository;

    public MockIotClient(WebClient iotWebClient,
                         @Qualifier("iotTaskExecutor") Executor iotTaskExecutor,
                         DeviceJpaRepository deviceJpaRepository) {
        this.webClient = iotWebClient;
        this.iotTaskExecutor = iotTaskExecutor;
        this.deviceJpaRepository = deviceJpaRepository;
    }

    // ── 제어 (device_id 기반, 내부에서 mac_address 조회) ──

    @Override
    public IotResponse sendCommand(Long deviceId, String command, Map<String, Object> params) {
        // DB에서 device_id → mac_address 조회
        String macAddress = deviceJpaRepository.findById(deviceId)
                .map(DeviceEntity::getMacAddress)
                .orElse(null);

        if (macAddress == null) {
            log.error("[IoT 제어 실패] deviceId: {} — DB에서 MAC 주소를 찾을 수 없습니다", deviceId);
            return IotResponse.failure(deviceId, command, "기기를 찾을 수 없습니다");
        }

        try {
            return CompletableFuture.supplyAsync(
                    () -> executeCommand(macAddress, deviceId, command, params),
                    iotTaskExecutor
            ).get(GLOBAL_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            log.error("[IoT 타임아웃] deviceId: {}, mac: {}, command: {} — 전체 타임아웃({}초) 초과",
                    deviceId, macAddress, command, GLOBAL_TIMEOUT.toSeconds());
            return IotResponse.failure(deviceId, command, "IoT 기기 응답 타임아웃");
        } catch (Exception e) {
            log.error("[IoT 통신 실패] deviceId: {}, mac: {}, command: {} — {}",
                    deviceId, macAddress, command, e.getMessage());
            return IotResponse.failure(deviceId, command, "IoT 통신 실패: " + e.getMessage());
        }
    }

    /**
     * 실제 WebClient HTTP 호출 (iot-worker 스레드에서 실행, MAC 기반)
     */
    private IotResponse executeCommand(String macAddress, Long deviceId, String command, Map<String, Object> params) {
        Map<String, Object> requestBody = Map.of(
                "mac_address", macAddress,
                "command", command,
                "params", params != null ? params : Map.of()
        );

        try {
            String response = webClient.post()
                    .uri(CONTROL_ENDPOINT)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseResponse(response, deviceId, command);
        } catch (WebClientResponseException e) {
            log.error("[IoT 응답 에러] mac: {}, command: {}, status: {}, body: {}",
                    macAddress, command, e.getStatusCode(), e.getResponseBodyAsString());
            return parseErrorResponse(e.getResponseBodyAsString(), deviceId, command);
        } catch (WebClientRequestException e) {
            log.error("[IoT 연결 실패] mac: {}, command: {} — {}",
                    macAddress, command, e.getMessage());
            return IotResponse.failure(deviceId, command, "IoT 서버 연결 실패");
        } catch (Exception e) {
            log.error("[IoT 통신 실패] mac: {}, command: {} — {}",
                    macAddress, command, e.getMessage());
            return IotResponse.failure(deviceId, command, "IoT 통신 실패: " + e.getMessage());
        }
    }

    // ── 게이트웨이 발견 ──

    private static final String GATEWAYS_ENDPOINT = "/api/gateways";

    @Override
    @SuppressWarnings("unchecked")
    public List<IotGatewayInfo> discoverGateways() {
        try {
            String response = webClient.get()
                    .uri(GATEWAYS_ENDPOINT)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(5));

            if (response == null) return List.of();

            Map<String, Object> body = MAPPER.readValue(response, new TypeReference<>() {});
            if (!Boolean.TRUE.equals(body.get("success"))) return List.of();

            List<Map<String, Object>> gateways = (List<Map<String, Object>>) body.get("gateways");
            if (gateways == null) return List.of();

            return gateways.stream()
                    .map(gw -> new IotGatewayInfo(
                            (String) gw.get("host"),
                            ((Number) gw.getOrDefault("deviceCount", 0)).intValue(),
                            ((Number) gw.getOrDefault("onlineCount", 0)).intValue(),
                            ((Number) gw.getOrDefault("errorCount", 0)).intValue()
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("[IoT 게이트웨이 목록 조회 실패] — {}", e.getMessage());
            return List.of();
        }
    }

    // ── 기기 발견 (discover) ──

    @Override
    public List<IotDeviceInfo> discoverDevices() {
        return fetchDeviceList(DEVICES_ENDPOINT);
    }

    @Override
    public List<IotDeviceInfo> discoverDevicesByHost(String host) {
        return fetchDeviceList(DEVICES_ENDPOINT + "?host=" + host);
    }

    @Override
    public IotDeviceInfo getDeviceByMac(String macAddress) {
        try {
            String response = webClient.get()
                    .uri(DEVICES_ENDPOINT + "/" + macAddress)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(5));

            if (response == null) return null;

            Map<String, Object> body = MAPPER.readValue(response, new TypeReference<>() {});
            if (!Boolean.TRUE.equals(body.get("success"))) return null;

            @SuppressWarnings("unchecked")
            Map<String, Object> deviceMap = (Map<String, Object>) body.get("device");
            return mapToDeviceInfo(deviceMap);
        } catch (Exception e) {
            log.error("[IoT 기기 조회 실패] mac: {} — {}", macAddress, e.getMessage());
            return null;
        }
    }

    // ── 내부 유틸 ──

    @SuppressWarnings("unchecked")
    private List<IotDeviceInfo> fetchDeviceList(String uri) {
        try {
            String response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(5));

            if (response == null) return List.of();

            Map<String, Object> body = MAPPER.readValue(response, new TypeReference<>() {});
            if (!Boolean.TRUE.equals(body.get("success"))) return List.of();

            List<Map<String, Object>> devices = (List<Map<String, Object>>) body.get("devices");
            if (devices == null) return List.of();

            return devices.stream()
                    .map(this::mapToDeviceInfo)
                    .filter(Objects::nonNull)
                    .toList();
        } catch (Exception e) {
            log.error("[IoT 기기 목록 조회 실패] uri: {} — {}", uri, e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private IotDeviceInfo mapToDeviceInfo(Map<String, Object> map) {
        if (map == null) return null;
        try {
            List<Map<String, Object>> capabilities = List.of();
            if (map.containsKey("capabilities") && map.get("capabilities") instanceof List) {
                capabilities = (List<Map<String, Object>>) map.get("capabilities");
            }

            return new IotDeviceInfo(
                    (String) map.get("mac_address"),
                    (String) map.get("model_name"),
                    (String) map.get("host"),
                    (String) map.get("local_ip"),
                    capabilities,
                    map.containsKey("state") && map.get("state") instanceof Map
                            ? (Map<String, Object>) map.get("state") : Map.of(),
                    (String) map.get("status"),
                    (String) map.get("error_mode")
            );
        } catch (Exception e) {
            log.warn("[IoT 기기 파싱 실패] — {}", e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private IotResponse parseResponse(String responseBody, Long deviceId, String command) {
        if (responseBody == null || responseBody.isBlank()) {
            log.warn("[IoT 응답 파싱] 빈 응답, 성공으로 처리: deviceId={}, command={}", deviceId, command);
            return new IotResponse(true, deviceId, command, "SUCCESS", null, "기기 제어 완료 (응답 없음)");
        }

        try {
            Map<String, Object> body = MAPPER.readValue(responseBody, new TypeReference<>() {});
            boolean success = Boolean.TRUE.equals(body.get("success"));
            String result = (String) body.getOrDefault("result", success ? "SUCCESS" : "FAILURE");
            Map<String, Object> state = body.containsKey("state") && body.get("state") instanceof Map
                    ? (Map<String, Object>) body.get("state") : null;
            String message = (String) body.getOrDefault("message", "기기 제어 완료");

            log.info("[IoT 제어 {}] deviceId: {}, command: {}, state: {}",
                    success ? "성공" : "실패", deviceId, command, state);

            return new IotResponse(success, deviceId, command, result, state, message);
        } catch (Exception e) {
            log.warn("[IoT 응답 파싱 실패] deviceId: {}, command: {}, body: {}", deviceId, command, responseBody, e);
            return new IotResponse(true, deviceId, command, "SUCCESS", null, "기기 제어 완료 (파싱 실패)");
        }
    }

    @SuppressWarnings("unchecked")
    private IotResponse parseErrorResponse(String responseBody, Long deviceId, String command) {
        if (responseBody == null || responseBody.isBlank()) {
            return IotResponse.failure(deviceId, command, "IoT 기기 오류 (응답 없음)");
        }

        try {
            Map<String, Object> body = MAPPER.readValue(responseBody, new TypeReference<>() {});
            String message = (String) body.getOrDefault("message", "IoT 기기 오류");
            return IotResponse.failure(deviceId, command, message);
        } catch (Exception e) {
            return IotResponse.failure(deviceId, command, "IoT 기기 오류");
        }
    }
}
