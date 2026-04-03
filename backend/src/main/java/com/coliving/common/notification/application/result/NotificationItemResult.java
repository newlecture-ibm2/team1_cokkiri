package com.coliving.common.notification.application.result;

import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class NotificationItemResult {
    private final Long notificationId;
    private final NotificationType type;
    private final String title;
    private final String message;
    private final ReferenceType referenceType;
    private final Long referenceId;
    private final boolean isRead;
    private final OffsetDateTime createdAt;
}
