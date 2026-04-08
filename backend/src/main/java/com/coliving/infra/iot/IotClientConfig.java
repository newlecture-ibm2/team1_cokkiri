package com.coliving.infra.iot;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * IoT 통신 전용 WebClient + 스레드풀 설정
 *
 * - WebClient: 논블로킹 HTTP 통신 (Connection 2초, Response 5초 타임아웃)
 * - 전용 스레드풀: IoT 지연이 톰캣 메인 스레드에 전파되지 않도록 격리
 * - coliving-plan.md §3: "Timeout 5초. Mock 서버 지연 시 백엔드 미영향"
 */
@Configuration
public class IotClientConfig {

    @Bean
    public WebClient iotWebClient(@Value("${mock-iot.base-url}") String baseUrl) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 2_000)     // 연결 타임아웃 2초
                .responseTimeout(Duration.ofSeconds(5))                  // 응답 타임아웃 5초
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(5, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(5, TimeUnit.SECONDS))
                );

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    /**
     * IoT 전용 스레드풀 — 톰캣 스레드와 격리
     * IoT 서버가 지연되어도 메인 API(로그인, 방 조회 등)는 영향 없음
     */
    @Bean("iotTaskExecutor")
    public Executor iotTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);                                      // 최소 5 스레드
        executor.setMaxPoolSize(10);                                      // 최대 10 스레드
        executor.setQueueCapacity(50);                                    // 대기열 50개
        executor.setThreadNamePrefix("iot-worker-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        executor.initialize();
        return executor;
    }
}
