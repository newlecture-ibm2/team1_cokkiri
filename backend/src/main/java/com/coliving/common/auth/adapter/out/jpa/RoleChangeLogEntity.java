package com.coliving.common.auth.adapter.out.jpa;

import com.coliving.common.auth.model.UserRole;
import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * ROLE_CHANGE_LOG 테이블 매핑 JPA Entity
 * - 사용자 역할 변경 이력 추적 (감사 로그)
 * - 계약 체결(ACTIVE) → RESIDENT 승격, 만료/해지 → USER 강등 등
 * - Soft Delete 적용
 */
@Entity
@Table(name = "role_change_log",
        indexes = {
                @Index(name = "idx_role_change_log_user_id", columnList = "user_id")
        }
)
@SQLDelete(sql = "UPDATE role_change_log SET deleted_at = CURRENT_TIMESTAMP WHERE role_change_log_id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RoleChangeLogEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_change_log_id")
    private Long roleChangeLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_role_change_log_user"))
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_role", nullable = false, length = 10)
    private UserRole oldRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_role", nullable = false, length = 10)
    private UserRole newRole;

    @Column(name = "reason", length = 100)
    private String reason;

    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "changed_by")
    private Long changedBy;
}
