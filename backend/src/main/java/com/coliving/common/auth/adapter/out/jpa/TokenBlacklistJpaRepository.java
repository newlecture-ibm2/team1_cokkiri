package com.coliving.common.auth.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;

/**
 * TOKEN_BLACKLIST 테이블 JPA Repository
 */
public interface TokenBlacklistJpaRepository extends JpaRepository<TokenBlacklistEntity, Long> {

    /**
     * JTI로 블랙리스트 존재 여부 확인
     */
    boolean existsByTokenJti(String tokenJti);

    /**
     * 만료된 블랙리스트 항목 정리 (배치 작업용)
     */
    void deleteAllByExpiresAtBefore(OffsetDateTime dateTime);
}
