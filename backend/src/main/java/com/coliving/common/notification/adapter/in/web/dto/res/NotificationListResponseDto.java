package com.coliving.common.notification.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class NotificationListResponseDto {
    private final List<NotificationItemResponseDto> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
