package com.coliving.common.comment.application.event;

import com.coliving.common.comment.application.port.out.CommentRepositoryPort;
import com.coliving.common.community.application.port.out.CommunityRepositoryPort;
import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommentPostedNotificationListener {

    private final CommunityRepositoryPort communityRepositoryPort;
    private final CommentRepositoryPort commentRepositoryPort;
    private final CreateNotificationUseCase createNotificationUseCase;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCommentPosted(CommentPostedEvent event) {
        if (event == null || event.getPostId() == null || event.getActorId() == null) {
            return;
        }

        try {
            notifyPostAuthor(event);
            notifyParentCommentAuthor(event);
        } catch (Exception e) {
            log.warn("댓글 알림 발송 실패 postId={}: {}", event.getPostId(), e.getMessage());
        }
    }

    private void notifyPostAuthor(CommentPostedEvent event) {
        communityRepositoryPort.findPostById(event.getPostId()).ifPresent(post -> {
            if (Objects.equals(post.getUserId(), event.getActorId())) {
                return;
            }
            try {
                createNotificationUseCase.create(CreateNotificationCommand.builder()
                        .userId(post.getUserId())
                        .type(NotificationType.COMMUNITY_COMMENT)
                        .title("새로운 댓글")
                        .message(String.format("내 게시글 '%s'에 새로운 댓글이 달렸습니다.", truncateTitle(post.getTitle())))
                        .referenceType(ReferenceType.COMMUNITY)
                        .referenceId(post.getPostId())
                        .build());
            } catch (Exception e) {
                log.warn("게시글 작성자 댓글 알림 실패 userId={}: {}", post.getUserId(), e.getMessage());
            }
        });
    }

    private void notifyParentCommentAuthor(CommentPostedEvent event) {
        if (event.getParentCommentId() == null) {
            return;
        }
        commentRepositoryPort.findCommentById(event.getParentCommentId()).ifPresent(parent -> {
            if (Objects.equals(parent.getUserId(), event.getActorId())) {
                return;
            }
            boolean isPostOwner = communityRepositoryPort.findPostById(event.getPostId())
                    .map(p -> Objects.equals(p.getUserId(), parent.getUserId()))
                    .orElse(false);
            if (isPostOwner) {
                return;
            }
            try {
                createNotificationUseCase.create(CreateNotificationCommand.builder()
                        .userId(parent.getUserId())
                        .type(NotificationType.COMMUNITY_COMMENT)
                        .title("새로운 답글")
                        .message("내 댓글에 새로운 답글이 달렸습니다.")
                        .referenceType(ReferenceType.COMMUNITY)
                        .referenceId(event.getPostId())
                        .build());
            } catch (Exception e) {
                log.warn("원댓글 작성자 답글 알림 실패 userId={}: {}", parent.getUserId(), e.getMessage());
            }
        });
    }

    private static String truncateTitle(String title) {
        if (title == null) {
            return "";
        }
        return title.length() > 10 ? title.substring(0, 10) + "..." : title;
    }
}
