package com.coliving.common.notification.application.port.out;

import java.util.List;

public interface NotificationUserQueryPort {
    /**
     * 알림을 수신할 모든 활성 관리자의 ID를 조회합니다.
     */
    List<Long> findActiveAdminUserIds();

    /**
     * 알림을 수신할 모든 활성 입주민(유저)의 ID를 조회합니다.
     */
    List<Long> findActiveResidentUserIds();
}
