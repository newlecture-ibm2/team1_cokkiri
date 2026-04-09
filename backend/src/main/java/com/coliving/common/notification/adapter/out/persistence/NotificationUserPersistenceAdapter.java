package com.coliving.common.notification.adapter.out.persistence;

import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.common.notification.application.port.out.NotificationUserQueryPort;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 알림 수신 대상자 조회 어댑터
 * - 타 도메인(admin.user, auth)의 코드를 수정하지 않고 직접 필요한 ID 목록만 조회합니다.
 */
@Component
public class NotificationUserPersistenceAdapter implements NotificationUserQueryPort {

    private final EntityManager entityManager;

    public NotificationUserPersistenceAdapter(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public List<Long> findActiveAdminUserIds() {
        return entityManager.createQuery(
                "SELECT u.userId FROM UserEntity u " +
                "WHERE u.role = :role AND u.status = :status AND u.deletedAt IS NULL", Long.class)
                .setParameter("role", UserRole.ADMIN)
                .setParameter("status", UserStatus.ACTIVE)
                .getResultList();
    }

    @Override
    public List<Long> findActiveResidentUserIds() {
        return entityManager.createQuery(
                "SELECT u.userId FROM UserEntity u " +
                "WHERE u.role = :role AND u.status = :status AND u.deletedAt IS NULL", Long.class)
                .setParameter("role", UserRole.USER)
                .setParameter("status", UserStatus.ACTIVE)
                .getResultList();
    }
}
