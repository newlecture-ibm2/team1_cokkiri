package com.coliving.common.comment.application.service;

import com.coliving.common.comment.application.command.*;
import com.coliving.common.comment.application.port.in.CommentUseCase;
import com.coliving.common.comment.application.port.out.CommentRepositoryPort;
import com.coliving.common.comment.application.result.CommentResult;
import com.coliving.common.community.application.port.out.CommunityRepositoryPort;
import com.coliving.common.community.model.ActorRole;
import com.coliving.common.community.model.Comment;
import com.coliving.common.community.model.Post;
import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CommentService implements CommentUseCase {
    private static final String DELETED_WITH_REPLY_PLACEHOLDER = "[삭제된 댓글입니다.]";

    private final CommentRepositoryPort commentRepositoryPort;
    private final CommunityRepositoryPort communityRepositoryPort;
    private final CreateNotificationUseCase createNotificationUseCase;

    public CommentService(CommentRepositoryPort commentRepositoryPort,
                          CommunityRepositoryPort communityRepositoryPort,
                          CreateNotificationUseCase createNotificationUseCase) {
        this.commentRepositoryPort = commentRepositoryPort;
        this.communityRepositoryPort = communityRepositoryPort;
        this.createNotificationUseCase = createNotificationUseCase;
    }

    @Override
    @Transactional
    public CommentResult createComment(CreateCommentCommand command) {
        Comment created = commentRepositoryPort.createComment(
                command.getPostId(),
                command.getActorId(),
                command.getParentCommentId(),
                command.getContent()
        );

        // 알림 처리: 비즈니스 로직(댓글 등록)에 영향을 주지 않도록 예외 처리
        try {
            // 1. 게시글 작성자에게 알림 (본인이 단 댓글이 아닐 때만)
            communityRepositoryPort.findPostById(command.getPostId()).ifPresent(post -> {
                if (!post.getUserId().equals(command.getActorId())) {
                    createNotificationUseCase.create(CreateNotificationCommand.builder()
                            .userId(post.getUserId())
                            .type(NotificationType.COMMUNITY_COMMENT)
                            .title("새로운 댓글")
                            .message(String.format("내 게시글 '%s'에 새로운 댓글이 달렸습니다.", truncateTitle(post.getTitle())))
                            .referenceType(ReferenceType.COMMUNITY)
                            .referenceId(post.getPostId())
                            .build());
                }
            });

            // 2. 답글인 경우 원댓글 작성자에게 알림 (본인이 단 답글이 아니고, 게시글 작성자와 다른 경우만 - 중복 방지)
            if (command.getParentCommentId() != null) {
                commentRepositoryPort.findCommentById(command.getParentCommentId()).ifPresent(parent -> {
                    if (!parent.getUserId().equals(command.getActorId())) {
                        // 게시글 작성자와 원댓글 작성자가 다를 때만 별도 알림 (같으면 위에서 이미 보냄)
                        boolean isPostOwner = communityRepositoryPort.findPostById(command.getPostId())
                                .map(p -> p.getUserId().equals(parent.getUserId()))
                                .orElse(false);
                        
                        if (!isPostOwner) {
                            createNotificationUseCase.create(CreateNotificationCommand.builder()
                                    .userId(parent.getUserId())
                                    .type(NotificationType.COMMUNITY_COMMENT)
                                    .title("새로운 답글")
                                    .message("내 댓글에 새로운 답글이 달렸습니다.")
                                    .referenceType(ReferenceType.COMMUNITY)
                                    .referenceId(command.getPostId())
                                    .build());
                        }
                    }
                });
            }
        } catch (Exception e) {
            log.error("Failed to send comment notification for postId: {}", command.getPostId(), e);
        }

        return CommentResult.builder()
                .commentId(created.getCommentId())
                .postId(created.getPostId())
                .createdAt(created.getCreatedAt())
                .build();
    }

    private String truncateTitle(String title) {
        if (title == null) return "";
        return title.length() > 10 ? title.substring(0, 10) + "..." : title;
    }

    @Override
    @Transactional
    public CommentResult updateComment(UpdateCommentCommand command) {
        Comment existing = commentRepositoryPort.findCommentById(command.getCommentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 자식 댓글 보존을 위해 삭제 처리된 부모 댓글은 수정 불가
        if (DELETED_WITH_REPLY_PLACEHOLDER.equals(existing.getContent())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (command.getActorRole() != ActorRole.ADMIN && !existing.getUserId().equals(command.getActorId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        Comment updated = commentRepositoryPort.updateComment(command.getCommentId(), command.getContent());

        return CommentResult.builder()
                .commentId(updated.getCommentId())
                .postId(updated.getPostId())
                .createdAt(updated.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public CommentResult deleteComment(DeleteCommentCommand command) {
        Comment existing = commentRepositoryPort.findCommentById(command.getCommentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (command.getActorRole() != ActorRole.ADMIN && !existing.getUserId().equals(command.getActorId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (commentRepositoryPort.hasActiveChildren(command.getCommentId())) {
            commentRepositoryPort.updateComment(command.getCommentId(), DELETED_WITH_REPLY_PLACEHOLDER);
        } else {
            commentRepositoryPort.softDeleteComment(command.getCommentId());
        }

        return CommentResult.builder()
                .commentId(existing.getCommentId())
                .postId(existing.getPostId())
                .createdAt(existing.getCreatedAt())
                .build();
    }
}

