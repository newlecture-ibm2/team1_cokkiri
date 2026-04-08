package com.coliving.common.notification.application.event;

import com.coliving.common.notification.model.Notification;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class NotificationCreatedEvent {
    private final Notification notification;
}
