package com.coliving.common.notification.application.result;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MarkNotificationReadResult {
    private final Long notificationId;
    private final boolean isRead;
}
