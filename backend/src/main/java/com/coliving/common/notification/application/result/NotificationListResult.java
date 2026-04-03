package com.coliving.common.notification.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class NotificationListResult {
    private final List<NotificationItemResult> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
