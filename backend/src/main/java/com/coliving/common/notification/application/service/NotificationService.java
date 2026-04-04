package com.coliving.common.notification.application.service;

import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.command.ListNotificationsCommand;
import com.coliving.common.notification.application.command.MarkNotificationReadCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.application.port.in.NotificationUseCase;
import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.notification.application.result.CreateNotificationResult;
import com.coliving.common.notification.application.result.MarkNotificationReadResult;
import com.coliving.common.notification.application.result.NotificationItemResult;
import com.coliving.common.notification.application.result.NotificationListResult;
import com.coliving.common.notification.model.Notification;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService implements NotificationUseCase, CreateNotificationUseCase {

    private final NotificationRepositoryPort notificationRepositoryPort;

    public NotificationService(NotificationRepositoryPort notificationRepositoryPort) {
        this.notificationRepositoryPort = notificationRepositoryPort;
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationListResult listNotifications(ListNotificationsCommand command) {
        Sort sort = parseSort(command.getSort());
        PageRequest pageRequest = PageRequest.of(command.getPage(), command.getSize(), sort);

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
    @Transactional
    public CreateNotificationResult create(CreateNotificationCommand command) {
        if (command.getUserId() == null || command.getType() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        if (command.getTitle() == null || command.getTitle().isBlank()
                || command.getMessage() == null || command.getMessage().isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        Notification saved = notificationRepositoryPort.create(
                command.getUserId(),
                command.getType(),
                command.getTitle(),
                command.getMessage(),
                command.getReferenceType(),
                command.getReferenceId()
        );

        return CreateNotificationResult.builder()
                .notificationId(saved.getNotificationId())
                .build();
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

        return Sort.by(direction, property.isBlank() ? "createdAt" : property);
    }
}
