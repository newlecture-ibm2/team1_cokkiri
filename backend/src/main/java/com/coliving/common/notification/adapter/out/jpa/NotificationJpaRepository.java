package com.coliving.common.notification.adapter.out.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.coliving.common.notification.model.ReferenceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, Long> {

    @Query("""
            SELECT n FROM NotificationEntity n
            WHERE n.userId = :userId
            AND (:isRead IS NULL OR n.isRead = :isRead)
            """)
    Page<NotificationEntity> findPageByUserIdAndOptionalRead(
            @Param("userId") Long userId,
            @Param("isRead") Boolean isRead,
            Pageable pageable
    );

    Optional<NotificationEntity> findByNotificationIdAndUserId(Long notificationId, Long userId);

    List<NotificationEntity> findByReferenceTypeAndReferenceId(ReferenceType referenceType, Long referenceId);
}
