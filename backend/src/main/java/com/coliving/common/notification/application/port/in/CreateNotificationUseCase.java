package com.coliving.common.notification.application.port.in;

import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.result.CreateNotificationResult;

/**
 * 다른 도메인(계약, VoC 등)에서 알림 행만 생성할 때 사용하는 진입점.
 */
public interface CreateNotificationUseCase {

    CreateNotificationResult create(CreateNotificationCommand command);
}
