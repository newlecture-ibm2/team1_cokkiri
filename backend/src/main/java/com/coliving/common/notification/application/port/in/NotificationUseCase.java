package com.coliving.common.notification.application.port.in;

import com.coliving.common.notification.application.command.ListNotificationsCommand;
import com.coliving.common.notification.application.command.MarkNotificationReadCommand;
import com.coliving.common.notification.application.result.MarkNotificationReadResult;
import com.coliving.common.notification.application.result.NotificationListResult;

public interface NotificationUseCase {

    NotificationListResult listNotifications(ListNotificationsCommand command);

    MarkNotificationReadResult markAsRead(MarkNotificationReadCommand command);
}
