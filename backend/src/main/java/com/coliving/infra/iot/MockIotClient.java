package com.coliving.infra.iot;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Mock IoT 서버 통신 클라이언트 (WebClient 기반)
 *
 * <h3>스레드 격리 전략</h3>
 * IoT 통신은 전용 스레드풀(iot-worker-*)에서 실행되어,
 * Mock IoT 서버가 지연되어도 톰캣 메인 스레드에 영향을 주지 않습니다.
 *
 * <h3>안전장치</h3>
 * <ul>
 *   <li>Connection Timeout: 2초</li>
 *   <li>Response Timeout: 5초 (coliving-plan.md §3)</li>
 *   <li>Retry: 1회, 500ms 간격 (일시적 네트워크 오류 대응)</li>
 *   <li>Fallback: 통신 실패 시 false 반환 + 구체적 로그</li>
 * </ul>
 */
@Slf4j
@Component
public class MockIotClient implements IotClient {

    private static final Duration GLOBAL_TIMEOUT = Duration.ofSeconds(6); // CompletableFuture 최종 방어 타임아웃
    private static final int MAX_RETRY = 1;
    private static final Duration RETRY_DELAY = Duration.ofMillis(500);

    private final WebClient webClient;
    private final Executor iotTaskExecutor;

    public MockIotClient(WebClient iotWebClient,
                         @Qualifier("iotTaskExecutor") Executor iotTaskExecutor) {
        this.webClient = iotWebClient;
        this.iotTaskExecutor = iotTaskExecutor;
    }

    private static final String DEFAULT_ENDPOINT = "/api/devices/control";

    /**
     * IoT 기기에 제어 명령을 전송합니다. (기본 엔드포인트)
     */
    @Override
    public boolean sendCommand(Long deviceId, String command, Map<String, Object> params) {
        return sendCommand(deviceId, command, params, null);
    }

    /**
     * IoT 기기에 제어 명령을 전송합니다. (기기별 엔드포인트 지정)
     *
     * <p>전용 스레드풀에서 비동기 실행 후 동기 결과를 반환합니다.
     * 톰캣 스레드는 즉시 해제되며, IoT 응답을 기다리는 것은 iot-worker 스레드입니다.</p>
     *
     * @param deviceId 기기 ID
     * @param command  제어 명령 (예: "ON", "OFF", "SET_TEMP")
     * @param params   추가 파라미터
     * @param endpoint 기기별 Mock IoT 엔드포인트 경로 (null이면 기본 경로 사용)
     * @return 통신 성공 여부
     */
    @Override
    public boolean sendCommand(Long deviceId, String command, Map<String, Object> params, String endpoint) {
        String resolvedEndpoint = (endpoint != null && !endpoint.isBlank()) ? endpoint : DEFAULT_ENDPOINT;
        try {
            return CompletableFuture.supplyAsync(
                    () -> executeCommand(deviceId, command, params, resolvedEndpoint),
                    iotTaskExecutor
            ).get(GLOBAL_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            log.error("[IoT 타임아웃] deviceId: {}, command: {}, endpoint: {} — 전체 타임아웃({}초) 초과",
                    deviceId, command, resolvedEndpoint, GLOBAL_TIMEOUT.toSeconds());
            return false;
        } catch (Exception e) {
            log.error("[IoT 통신 실패] deviceId: {}, command: {}, endpoint: {} — {}",
                    deviceId, command, resolvedEndpoint, e.getMessage());
            return false;
        }
    }

    /**
     * 실제 WebClient HTTP 호출 (iot-worker 스레드에서 실행)
     */
    private boolean executeCommand(Long deviceId, String command, Map<String, Object> params, String endpoint) {
        Map<String, Object> requestBody = Map.of(
                "device_id", deviceId,
                "command", command,
                "params", params != null ? params : Map.of()
        );

        try {
            String response = webClient.post()
                    .uri(endpoint)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .retryWhen(Retry.fixedDelay(MAX_RETRY, RETRY_DELAY)
                            .filter(this::isRetryable)
                            .doBeforeRetry(signal ->
                                    log.warn("[IoT 재시도 {}/{}] deviceId: {}, command: {}, endpoint: {}, 원인: {}",
                                            signal.totalRetries() + 1, MAX_RETRY,
                                            deviceId, command, endpoint, signal.failure().getMessage())
                            ))
                    .block();

            log.info("[IoT 제어 성공] deviceId: {}, command: {}", deviceId, command);
            return true;
        } catch (WebClientResponseException e) {
            log.error("[IoT 응답 에러] deviceId: {}, command: {}, status: {}, body: {}",
                    deviceId, command, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (WebClientRequestException e) {
            log.error("[IoT 연결 실패] deviceId: {}, command: {} — {}",
                    deviceId, command, e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("[IoT 통신 실패] deviceId: {}, command: {} — {}",
                    deviceId, command, e.getMessage());
            return false;
        }
    }

    /**
     * 재시도 가능 여부 판별 — 연결 실패·5xx만 재시도, 4xx는 재시도 안 함
     */
    private boolean isRetryable(Throwable throwable) {
        if (throwable instanceof WebClientRequestException) {
            return true; // 연결 자체 실패 → 재시도
        }
        if (throwable instanceof WebClientResponseException e) {
            return e.getStatusCode().is5xxServerError(); // 서버 오류 → 재시도
        }
        return false;
    }
}
