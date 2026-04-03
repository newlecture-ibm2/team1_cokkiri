package com.coliving.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.OffsetDateTime;
import java.util.Optional;

@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "offsetDateTimeProvider")
public class JpaConfig {

    /**
     * BaseEntity uses {@link OffsetDateTime}; Spring Data's default auditing clock is
     * {@link java.time.LocalDateTime}, which fails at persist time without this provider.
     */
    @Bean
    public DateTimeProvider offsetDateTimeProvider() {
        return () -> Optional.of(OffsetDateTime.now());
    }
}
