package com.coliving.common.comment.adapter.in.web;

import com.coliving.common.comment.adapter.in.web.dto.req.CreateCommentRequestDto;
import com.coliving.common.comment.adapter.in.web.dto.req.UpdateCommentRequestDto;
import com.coliving.common.comment.adapter.in.web.dto.res.CommentMutationResponseDto;
import com.coliving.common.comment.application.command.*;
import com.coliving.common.comment.application.port.in.CommentUseCase;
import com.coliving.common.comment.application.result.CommentResult;
import com.coliving.common.community.model.ActorRole;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
public class CommentController {

    private final CommentUseCase commentUseCase;

    public CommentController(CommentUseCase commentUseCase) {
        this.commentUseCase = commentUseCase;
    }

    @PostMapping("/api/posts/{postId}/comments")
    public ApiResponse<CommentMutationResponseDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequestDto request
    ) {
        ActorInfo actor = getActorInfo();

        CreateCommentCommand command = CreateCommentCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.actorRole)
                .postId(postId)
                .content(request.getContent())
                .build();

        CommentResult result = commentUseCase.createComment(command);

        CommentMutationResponseDto response = CommentMutationResponseDto.builder()
                .commentId(result.getCommentId())
                .postId(result.getPostId())
                .createdAt(result.getCreatedAt())
                .build();

        return ApiResponse.ok(response);
    }

    @PutMapping("/api/comments/{commentId}")
    public ApiResponse<CommentMutationResponseDto> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequestDto request
    ) {
        ActorInfo actor = getActorInfo();

        UpdateCommentCommand command = UpdateCommentCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.actorRole)
                .commentId(commentId)
                .content(request.getContent())
                .build();

        CommentResult result = commentUseCase.updateComment(command);

        CommentMutationResponseDto response = CommentMutationResponseDto.builder()
                .commentId(result.getCommentId())
                .postId(result.getPostId())
                .createdAt(result.getCreatedAt())
                .build();

        return ApiResponse.ok(response);
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ApiResponse<CommentMutationResponseDto> deleteComment(@PathVariable Long commentId) {
        ActorInfo actor = getActorInfo();

        DeleteCommentCommand command = DeleteCommentCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.actorRole)
                .commentId(commentId)
                .build();

        CommentResult result = commentUseCase.deleteComment(command);

        CommentMutationResponseDto response = CommentMutationResponseDto.builder()
                .commentId(result.getCommentId())
                .postId(result.getPostId())
                .createdAt(result.getCreatedAt())
                .build();

        return ApiResponse.ok(response);
    }

    private ActorInfo getActorInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        Long actorId;
        try {
            actorId = Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        ActorRole actorRole = extractActorRole(authentication);
        return new ActorInfo(actorId, actorRole);
    }

    private ActorRole extractActorRole(Authentication authentication) {
        GrantedAuthority authority = authentication.getAuthorities().stream()
                .filter(a -> a != null && a.getAuthority() != null && a.getAuthority().startsWith("ROLE_"))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));

        String role = authority.getAuthority().substring("ROLE_".length());
        try {
            return ActorRole.valueOf(role);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private static class ActorInfo {
        private final Long actorId;
        private final ActorRole actorRole;

        private ActorInfo(Long actorId, ActorRole actorRole) {
            this.actorId = actorId;
            this.actorRole = actorRole;
        }
    }
}

