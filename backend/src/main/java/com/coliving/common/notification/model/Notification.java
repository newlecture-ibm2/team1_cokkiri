package com.coliving.common.notification.model;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class Notification {
    private final Long notificationId;
    private final Long userId;
    private final NotificationType type;
    private final String title;
    private final String message;
    private final ReferenceType referenceType;
    private final Long referenceId;
    private final boolean isRead;
    private final OffsetDateTime createdAt;
}
