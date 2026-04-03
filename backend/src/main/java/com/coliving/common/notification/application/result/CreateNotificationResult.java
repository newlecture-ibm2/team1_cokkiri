package com.coliving.common.notification.application.result;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateNotificationResult {
    private final Long notificationId;
}
