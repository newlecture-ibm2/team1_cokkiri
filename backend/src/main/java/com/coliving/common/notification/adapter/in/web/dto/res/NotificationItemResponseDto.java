package com.coliving.common.notification.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class NotificationItemResponseDto {
    private final Long notificationId;
    private final String type;
    private final String title;
    private final String message;
    private final String referenceType;
    private final Long referenceId;
    private final boolean isRead;
    private final OffsetDateTime createdAt;
}
