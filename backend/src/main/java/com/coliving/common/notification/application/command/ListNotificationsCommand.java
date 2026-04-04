package com.coliving.common.notification.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListNotificationsCommand {
    private final Long userId;
    private final Boolean isRead;
    private final int page;
    private final int size;
    private final String sort;
}
