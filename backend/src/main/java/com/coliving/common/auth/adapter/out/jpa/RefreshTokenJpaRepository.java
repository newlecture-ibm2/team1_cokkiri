package com.coliving.common.auth.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * REFRESH_TOKEN 테이블 JPA Repository
 */
public interface RefreshTokenJpaRepository extends JpaRepository<RefreshTokenEntity, Long> {

    /**
     * 토큰 값으로 조회
     */
    Optional<RefreshTokenEntity> findByToken(String token);

    /**
     * 사용자 ID로 유효한(무효화되지 않은) 토큰 조회
     */
    Optional<RefreshTokenEntity> findByUser_UserIdAndIsRevokedFalse(Long userId);

    /**
     * 특정 사용자의 모든 토큰 무효화 (로그아웃, 비밀번호 변경 시)
     */
    @Modifying
    @Query("UPDATE RefreshTokenEntity r SET r.isRevoked = true WHERE r.user.userId = :userId AND r.isRevoked = false")
    int revokeAllByUserId(@Param("userId") Long userId);
}
