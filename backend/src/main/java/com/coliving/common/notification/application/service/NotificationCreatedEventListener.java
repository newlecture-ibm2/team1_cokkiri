package com.coliving.common.notification.application.service;

import com.coliving.common.notification.application.event.NotificationCreatedEvent;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class NotificationCreatedEventListener {
    private final NotificationRealtimeFanoutService notificationRealtimeFanoutService;

    public NotificationCreatedEventListener(NotificationRealtimeFanoutService notificationRealtimeFanoutService) {
        this.notificationRealtimeFanoutService = notificationRealtimeFanoutService;
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onNotificationCreated(NotificationCreatedEvent event) {
        if (event == null || event.getNotification() == null) {
            return;
        }
        notificationRealtimeFanoutService.publish(event.getNotification());
    }
}
