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

import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
    @Transactional
    public Notification create(Long userId,
                               NotificationType type,
                               String title,
                               String message,
                               ReferenceType referenceType,
                               Long referenceId) {
        if (userId == null) {
            log.warn("Notification creation skipped: userId is null");
            return null;
        }

        try {
            // 댓글 알림은 같은 글(postId)에 여러 번 와야 하므로 (user,type,ref) exists 로 막지 않음
            if (type != NotificationType.COMMUNITY_COMMENT
                    && exists(userId, type, referenceType, referenceId)) {
                log.info("Notification already exists for user: {}, type: {}, refId: {}", userId, type, referenceId);
                return null;
            }

            NotificationEntity entity = new NotificationEntity();
            entity.setUserId(userId);
            entity.setType(type);
            entity.setTitle(title);
            entity.setMessage(message);
            entity.setReferenceType(referenceType);
            entity.setReferenceId(referenceId);
            entity.setRead(false);
            
            entity = notificationJpaRepository.saveAndFlush(entity);
            return toModel(entity);
        } catch (DataIntegrityViolationException e) {
            log.warn("Notification integrity violation (duplicate): {}", e.getMessage());
            return null; // 메인 트랜잭션 보호를 위해 무시
        } catch (Exception e) {
            log.error("Unexpected notification creation error", e);
            return null; // 알림 실패가 본 업무를 중단시키지 않도록 격리
        }
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

    @Override
    @Transactional
    public void deleteByUser(Long notificationId, Long userId) {
        NotificationEntity entity = notificationJpaRepository
                .findByNotificationIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        entity.softDelete();
        notificationJpaRepository.save(entity);
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
