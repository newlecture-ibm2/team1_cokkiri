package com.coliving.common.comment.application.service;

import com.coliving.common.comment.application.command.*;
import com.coliving.common.comment.application.port.in.CommentUseCase;
import com.coliving.common.comment.application.port.out.CommentRepositoryPort;
import com.coliving.common.comment.application.result.CommentResult;
import com.coliving.common.community.model.ActorRole;
import com.coliving.common.community.model.Comment;
import com.coliving.common.comment.application.event.CommentPostedEvent;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CommentService implements CommentUseCase {
    private static final String DELETED_WITH_REPLY_PLACEHOLDER = "[삭제된 댓글입니다.]";

    private final CommentRepositoryPort commentRepositoryPort;
    private final ApplicationEventPublisher eventPublisher;

    public CommentService(CommentRepositoryPort commentRepositoryPort,
                          ApplicationEventPublisher eventPublisher) {
        this.commentRepositoryPort = commentRepositoryPort;
        this.eventPublisher = eventPublisher;
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

        eventPublisher.publishEvent(new CommentPostedEvent(
                command.getPostId(),
                command.getActorId(),
                command.getParentCommentId()));

        return CommentResult.builder()
                .commentId(created.getCommentId())
                .postId(created.getPostId())
                .createdAt(created.getCreatedAt())
                .build();
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

