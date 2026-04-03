package com.coliving.common.notification.application.command;

import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateNotificationCommand {
    private final Long userId;
    private final NotificationType type;
    private final String title;
    private final String message;
    private final ReferenceType referenceType;
    private final Long referenceId;
}
