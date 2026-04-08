package com.coliving.common.notification.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class NotificationSseEventResponseDto {
    private Long userId;
    private Long notificationId;
    private String type;
    private String title;
    private String message;
    private String referenceType;
    private Long referenceId;
    private boolean isRead;
    private OffsetDateTime createdAt;
}
