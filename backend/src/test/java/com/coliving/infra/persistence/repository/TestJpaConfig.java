package com.coliving.infra.persistence.repository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * 테스트용 JPA Auditing 설정
 * - BaseEntity의 createdAt/updatedAt이 OffsetDateTime이므로
 *   DateTimeProvider를 등록하여 Auditing 시 올바른 타입을 제공한다.
 */
@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "offsetDateTimeProvider")
public class TestJpaConfig {

    @Bean
    public DateTimeProvider offsetDateTimeProvider() {
        return () -> Optional.of(OffsetDateTime.now());
    }
}
