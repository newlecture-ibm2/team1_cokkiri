package com.coliving.common.auth.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.OffsetDateTime;

/**
 * TOKEN_BLACKLIST 테이블 매핑 JPA Entity
 * - 로그아웃 / 강제 만료된 JWT Access Token의 JTI를 저장
 * - Soft Delete 적용
 */
@Entity
@Table(name = "token_blacklists",
        indexes = {
                @Index(name = "idx_token_blacklist_expires_at", columnList = "expires_at")
        }
)
@SQLDelete(sql = "UPDATE token_blacklists SET deleted_at = CURRENT_TIMESTAMP WHERE token_blacklist_id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class TokenBlacklistEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_blacklist_id")
    private Long tokenBlacklistId;

    @Column(name = "token_jti", nullable = false, unique = true, length = 255)
    private String tokenJti;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "reason", length = 255)
    private String reason;

    // ── 유틸리티 메서드 ──

    /**
     * 원래 토큰의 만료 시각이 이미 지났는지 확인 (정리 대상 판별)
     */
    public boolean isOriginalTokenExpired() {
        return OffsetDateTime.now().isAfter(this.expiresAt);
    }
}
