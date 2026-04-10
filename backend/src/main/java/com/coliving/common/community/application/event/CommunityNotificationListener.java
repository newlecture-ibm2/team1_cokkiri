package com.coliving.common.community.application.event;

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
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommunityNotificationListener {

    private final AdminUserRepositoryPort adminUserRepositoryPort;
    private final CreateNotificationUseCase createNotificationUseCase;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onNoticePublished(NoticePublishedEvent event) {
        log.info("Starting ASYNC notice fan-out for post: {}", event.getPostId());
        
        int successCount = 0;
        int totalUsers = 0;

        try {
            for (UserRole role : List.of(UserRole.USER, UserRole.RESIDENT)) {
                // 대량 사용자 처리를 고려하여 페이징 호출 (여기서는 단순화하여 1000명까지 처리 예시)
                Page<AdminUserResult> userPage = adminUserRepositoryPort.findUsers(
                        role, UserStatus.ACTIVE.name(), null, null, PageRequest.of(0, 1000));
                
                if (userPage == null || userPage.getContent() == null) continue;

                totalUsers += userPage.getContent().size();
                for (AdminUserResult user : userPage.getContent()) {
                    try {
                        createNotificationUseCase.create(CreateNotificationCommand.builder()
                                .userId(user.getId())
                                .type(NotificationType.COMMUNITY_NOTICE)
                                .title("새로운 공지사항")
                                .message(String.format("「%s」 공지사항이 등록되었습니다.", event.getTitle()))
                                .referenceType(ReferenceType.COMMUNITY)
                                .referenceId(event.getPostId())
                                .build());
                        successCount++;
                    } catch (Exception e) {
                        log.warn("Failed to send notice to user {}: {}", user.getId(), e.getMessage());
                    }
                }
            }
            log.info("Async Notice fan-out finished. Success: {}/{}, PostId: {}", 
                    successCount, totalUsers, event.getPostId());
        } catch (Exception e) {
            log.error("Critical error in CommunityNotificationListener: {}", e.getMessage());
        }
    }
}
