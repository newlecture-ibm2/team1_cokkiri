package com.coliving.common.notification.adapter.out.persistence;

import com.coliving.common.notification.adapter.out.jpa.NotificationEntity;
import com.coliving.common.notification.adapter.out.jpa.NotificationJpaRepository;
import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.notification.model.Notification;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
public class NotificationPersistenceAdapter implements NotificationRepositoryPort {

    private final NotificationJpaRepository notificationJpaRepository;

    public NotificationPersistenceAdapter(NotificationJpaRepository notificationJpaRepository) {
        this.notificationJpaRepository = notificationJpaRepository;
    }

    @Override
    public Page<Notification> findByUserId(Long userId, Boolean isRead, Pageable pageable) {
        return notificationJpaRepository
                .findPageByUserIdAndOptionalRead(userId, isRead, pageable)
                .map(this::toModel);
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        NotificationEntity entity = notificationJpaRepository
                .findByNotificationIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        entity.setRead(true);
        notificationJpaRepository.save(entity);
    }

    @Override
    public Notification create(Long userId,
                               NotificationType type,
                               String title,
                               String message,
                               ReferenceType referenceType,
                               Long referenceId) {
        NotificationEntity entity = new NotificationEntity();
        entity.setUserId(userId);
        entity.setType(type);
        entity.setTitle(title);
        entity.setMessage(message);
        entity.setReferenceType(referenceType);
        entity.setReferenceId(referenceId);
        entity.setRead(false);
        entity = notificationJpaRepository.save(entity);
        return toModel(entity);
    }

    @Override
    public void softDeleteByReference(ReferenceType referenceType, Long referenceId) {
        if (referenceType == null || referenceId == null) {
            return;
        }
        for (NotificationEntity entity : notificationJpaRepository.findByReferenceTypeAndReferenceId(
                referenceType, referenceId)) {
            entity.softDelete();
            notificationJpaRepository.save(entity);
        }
    }

    @Override
    public boolean exists(Long userId, NotificationType type, ReferenceType referenceType, Long referenceId) {
        return notificationJpaRepository.existsByUserIdAndTypeAndReferenceTypeAndReferenceId(
                userId, type, referenceType, referenceId
        );
    }

    private Notification toModel(NotificationEntity entity) {
        return Notification.builder()
                .notificationId(entity.getNotificationId())
                .userId(entity.getUserId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
