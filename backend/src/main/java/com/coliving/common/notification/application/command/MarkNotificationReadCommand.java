package com.coliving.common.notification.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MarkNotificationReadCommand {
    private final Long userId;
    private final Long notificationId;
}
