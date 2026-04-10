package com.coliving.common.voc.application.event;

import com.coliving.admin.user.application.port.out.AdminUserRepositoryPort;
import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class VocAdminNotifyEventListener {

    private final AdminUserRepositoryPort adminUserRepositoryPort;
    private final CreateNotificationUseCase createNotificationUseCase;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onVocAdminNotify(VocAdminNotifyEvent event) {
        if (event == null || event.getVocId() == null) {
            return;
        }

        Page<AdminUserResult> adminPage = adminUserRepositoryPort.findUsers(
                UserRole.ADMIN, UserStatus.ACTIVE.name(), null, null, Pageable.unpaged());
        if (adminPage == null || adminPage.getContent() == null || adminPage.getContent().isEmpty()) {
            return;
        }

        for (AdminUserResult admin : adminPage.getContent()) {
            if (admin.getId() == null) {
                continue;
            }
            try {
                createNotificationUseCase.create(CreateNotificationCommand.builder()
                        .userId(admin.getId())
                        .type(NotificationType.VOC_CREATED)
                        .title(event.getAlertTitle())
                        .message(String.format("「%s」 민원이 등록되었습니다.", event.getVocTitle()))
                        .referenceType(ReferenceType.VOC)
                        .referenceId(event.getVocId())
                        .build());
            } catch (Exception e) {
                log.warn("관리자 민원 알림 전송 실패 adminId={}, vocId={}: {}",
                        admin.getId(), event.getVocId(), e.getMessage());
            }
        }
    }
}
