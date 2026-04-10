package com.coliving.common.notification.adapter.in.web.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isRead")
    private boolean isRead;
    private OffsetDateTime createdAt;
}
