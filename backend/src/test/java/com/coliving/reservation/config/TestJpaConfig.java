package com.coliving.reservation.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * 테스트용 JPA Auditing 설정
 *
 * BaseEntity의 createdAt/updatedAt 필드가 OffsetDateTime 타입이므로,
 * 기본 DateTimeProvider 대신 OffsetDateTime을 반환하는 커스텀 Provider를 등록한다.
 */
@TestConfiguration
@EnableJpaAuditing(dateTimeProviderRef = "testDateTimeProvider")
public class TestJpaConfig {

    @Bean
    public DateTimeProvider testDateTimeProvider() {
        return () -> Optional.of(OffsetDateTime.now());
    }
}
