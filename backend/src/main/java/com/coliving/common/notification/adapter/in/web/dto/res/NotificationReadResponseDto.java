package com.coliving.common.notification.adapter.in.web.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationReadResponseDto {
    private final Long notificationId;
    @JsonProperty("isRead")
    private final boolean isRead;
}
