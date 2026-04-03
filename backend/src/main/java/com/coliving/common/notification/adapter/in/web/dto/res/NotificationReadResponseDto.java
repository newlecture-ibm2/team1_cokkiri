package com.coliving.common.notification.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationReadResponseDto {
    private final Long notificationId;
    private final boolean isRead;
}
