package com.coliving.common.notification.application.service;

import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.command.ListNotificationsCommand;
import com.coliving.common.notification.application.command.MarkNotificationReadCommand;
import com.coliving.common.notification.application.event.NotificationCreatedEvent;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.application.port.in.NotificationUseCase;
import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.notification.application.result.CreateNotificationResult;
import com.coliving.common.notification.application.result.MarkNotificationReadResult;
import com.coliving.common.notification.application.result.NotificationItemResult;
import com.coliving.common.notification.application.result.NotificationListResult;
import com.coliving.common.notification.model.Notification;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class NotificationService implements NotificationUseCase, CreateNotificationUseCase {
    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "createdAt", "updatedAt"
    );

    private final NotificationRepositoryPort notificationRepositoryPort;
    private final ApplicationEventPublisher eventPublisher;

    public NotificationService(NotificationRepositoryPort notificationRepositoryPort,
                               ApplicationEventPublisher eventPublisher) {
        this.notificationRepositoryPort = notificationRepositoryPort;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationListResult listNotifications(ListNotificationsCommand command) {
        int safePage = Math.max(0, command.getPage());
        int safeSize = normalizeSize(command.getSize());
        Sort sort = parseSort(command.getSort());
        PageRequest pageRequest = PageRequest.of(safePage, safeSize, sort);

        Page<Notification> page = notificationRepositoryPort.findByUserId(
                command.getUserId(),
                command.getIsRead(),
                pageRequest
        );

        List<NotificationItemResult> content = page.getContent().stream()
                .map(n -> NotificationItemResult.builder()
                        .notificationId(n.getNotificationId())
                        .type(n.getType())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .referenceType(n.getReferenceType())
                        .referenceId(n.getReferenceId())
                        .isRead(n.isRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();

        return NotificationListResult.builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CreateNotificationResult create(CreateNotificationCommand command) {
        if (command.getUserId() == null || command.getType() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        if (command.getTitle() == null || command.getTitle().isBlank()
                || command.getMessage() == null || command.getMessage().isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        // 댓글 알림은 referenceId가 글(postId)로 같아서 매 댓글마다 별도 알림이 필요함.
        // (userId, COMMUNITY_COMMENT, COMMUNITY, postId) 기준 exists 는 첫 댓글 이후 전부 스킵되는 버그가 됨.
        if (command.getType() != NotificationType.COMMUNITY_COMMENT
                && command.getReferenceType() != null
                && command.getReferenceId() != null) {
            boolean exists = notificationRepositoryPort.exists(
                    command.getUserId(),
                    command.getType(),
                    command.getReferenceType(),
                    command.getReferenceId()
            );
            if (exists) {
                return CreateNotificationResult.builder()
                        .notificationId(null)
                        .build();
            }
        }

        try {
            Notification saved = notificationRepositoryPort.create(
                    command.getUserId(),
                    command.getType(),
                    command.getTitle(),
                    command.getMessage(),
                    command.getReferenceType(),
                    command.getReferenceId()
            );
            if (saved == null) {
                return CreateNotificationResult.builder()
                        .notificationId(null)
                        .build();
            }
            eventPublisher.publishEvent(new NotificationCreatedEvent(saved));

            return CreateNotificationResult.builder()
                    .notificationId(saved.getNotificationId())
                    .build();
        } catch (DataIntegrityViolationException e) {
            log.warn("Duplicate notification attempt prevented: {} for user {}", 
                    command.getType(), command.getUserId());
            return CreateNotificationResult.builder()
                    .notificationId(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public MarkNotificationReadResult markAsRead(MarkNotificationReadCommand command) {
        notificationRepositoryPort.markAsRead(command.getNotificationId(), command.getUserId());

        return MarkNotificationReadResult.builder()
                .notificationId(command.getNotificationId())
                .isRead(true)
                .build();
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        notificationRepositoryPort.deleteByUser(notificationId, userId);
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",");
        if (parts.length != 2) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String property = parts[0].trim();
        Sort.Direction direction = "asc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        String safeProperty = property.isBlank() ? "createdAt" : property;
        if (!ALLOWED_SORT_PROPERTIES.contains(safeProperty)) {
            safeProperty = "createdAt";
        }

        return Sort.by(direction, safeProperty);
    }

    private int normalizeSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 100);
    }
}
