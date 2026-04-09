package com.coliving.common.notification.application.port.out;

import com.coliving.common.notification.model.Notification;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationRepositoryPort {

    Page<Notification> findByUserId(Long userId, Boolean isRead, Pageable pageable);

    void markAsRead(Long notificationId, Long userId);

    /**
     * reference_type + reference_id는 DB FK가 아닌 애플리케이션 수준 다형 참조입니다.
     * 대상 행 삭제/취소 시 {@link #softDeleteByReference} 등으로 정합성을 맞춥니다.
     */
    Notification create(Long userId, NotificationType type, String title, String message,
                        ReferenceType referenceType, Long referenceId);

    /**
     * 참조 대상이 무효화된 경우(예: 민원 취소) 연결된 알림을 soft delete 합니다.
     */
    void softDeleteByReference(ReferenceType referenceType, Long referenceId);

    boolean exists(Long userId, NotificationType type, ReferenceType referenceType, Long referenceId);
}
