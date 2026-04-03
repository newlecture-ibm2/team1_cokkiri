package com.coliving.common.community.adapter.in.web;

import com.coliving.common.community.adapter.in.web.dto.req.CreatePostRequestDto;
import com.coliving.common.community.application.command.*;
import com.coliving.common.community.application.port.in.CommunityUseCase;
import com.coliving.common.community.application.result.*;
import com.coliving.common.community.adapter.in.web.dto.res.*;
import com.coliving.common.community.model.ActorRole;
import com.coliving.common.community.model.Comment;
import com.coliving.common.community.model.PostCategory;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CommunityController {

    private final CommunityUseCase useCase;

    public CommunityController(CommunityUseCase useCase) {
        this.useCase = useCase;
    }

    @GetMapping("/api/posts")
    public ApiResponse<PostListResponseDto> getPostList(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort
    ) {
        ActorInfo actor = getActorInfo();
        PostCategory parsedCategory = parseCategoryOrNull(category);

        GetPostListCommand command = GetPostListCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.role)
                .category(parsedCategory)
                .page(page)
                .size(size)
                .sort(sort)
                .build();

        PostListResult result = useCase.getPostList(command);

        PostListResponseDto response = PostListResponseDto.builder()
                .content(result.getContent().stream()
                        .map(item -> PostListItemResponseDto.builder()
                                .postId(item.getPostId())
                                .category(item.getCategory().name())
                                .title(item.getTitle())
                                .authorUserId(item.getAuthorUserId())
                                .viewCount(item.getViewCount())
                                .likeCount(item.getLikeCount())
                                .commentCount(item.getCommentCount())
                                .createdAt(item.getCreatedAt())
                                .build())
                        .toList())
                .page(result.getPage())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return ApiResponse.ok(response);
    }

    @GetMapping("/api/posts/{postId}")
    public ApiResponse<PostDetailResponseDto> getPostDetail(@PathVariable Long postId) {
        ActorInfo actor = getActorInfo();

        GetPostDetailCommand command = GetPostDetailCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.role)
                .postId(postId)
                .build();

        PostDetailResult result = useCase.getPostDetail(command);

        PostAuthorResponseDto author = PostAuthorResponseDto.builder()
                .userId(result.getAuthorUserId())
                .name(null)
                .profileImage(null)
                .build();

        List<PostCommentResponseDto> commentDtos = result.getComments().stream()
                .map(this::toCommentDto)
                .toList();

        PostDetailResponseDto response = PostDetailResponseDto.builder()
                .postId(result.getPostId())
                .category(result.getCategory().name())
                .title(result.getTitle())
                .content(result.getContent())
                .attachments(result.getAttachments())
                .links(result.getLinks())
                .viewCount(result.getViewCount())
                .likeCount(result.getLikeCount())
                .commentCount(result.getCommentCount())
                .isLikedByMe(result.isLikedByMe())
                .author(author)
                .comments(commentDtos)
                .createdAt(result.getCreatedAt())
                .build();

        return ApiResponse.ok(response);
    }

    @PostMapping(value = "/api/posts", consumes = "application/json")
    public ApiResponse<PostIdResponseDto> createPost(
            @Valid @RequestBody CreatePostRequestDto request
    ) {
        ActorInfo actor = getActorInfo();
        PostCategory category = parseCategoryOrThrow(request.getCategory());

        CreatePostCommand command = CreatePostCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.role)
                .category(category)
                .title(request.getTitle())
                .content(request.getContent())
                .attachments(request.getAttachments())
                .links(request.getLinks())
                .build();

        CreatePostResult result = useCase.createPost(command);

        PostIdResponseDto response = PostIdResponseDto.builder()
                .postId(result.getPostId())
                .createdAt(result.getCreatedAt())
                .updatedAt(null)
                .build();

        return ApiResponse.ok(response);
    }

    @PutMapping(value = "/api/posts/{postId}", consumes = "application/json")
    public ApiResponse<PostIdResponseDto> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody CreatePostRequestDto request
    ) {
        ActorInfo actor = getActorInfo();
        PostCategory category = parseCategoryOrThrow(request.getCategory());

        UpdatePostCommand command = UpdatePostCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.role)
                .postId(postId)
                .category(category)
                .title(request.getTitle())
                .content(request.getContent())
                .attachments(request.getAttachments())
                .links(request.getLinks())
                .build();

        UpdatePostResult result = useCase.updatePost(command);

        PostIdResponseDto response = PostIdResponseDto.builder()
                .postId(result.getPostId())
                .createdAt(null)
                .updatedAt(result.getUpdatedAt())
                .build();

        return ApiResponse.ok(response);
    }

    @DeleteMapping("/api/posts/{postId}")
    public ApiResponse<PostIdResponseDto> deletePost(@PathVariable Long postId) {
        ActorInfo actor = getActorInfo();

        DeletePostCommand command = DeletePostCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.role)
                .postId(postId)
                .build();

        DeletePostResult result = useCase.deletePost(command);

        PostIdResponseDto response = PostIdResponseDto.builder()
                .postId(result.getPostId())
                .createdAt(null)
                .updatedAt(null)
                .build();

        return ApiResponse.ok(response);
    }

    @PostMapping("/api/posts/{postId}/like")
    public ApiResponse<ToggleLikeResponseDto> toggleLike(@PathVariable Long postId) {
        ActorInfo actor = getActorInfo();

        TogglePostLikeCommand command = TogglePostLikeCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.role)
                .postId(postId)
                .build();

        ToggleLikeResult result = useCase.toggleLike(command);

        ToggleLikeResponseDto response = ToggleLikeResponseDto.builder()
                .postId(result.getPostId())
                .liked(result.isLiked())
                .likeCount(result.getLikeCount())
                .build();

        return ApiResponse.ok(response);
    }

    // /api/posts/{postId}/comments, /api/comments/{commentId} 관련 엔드포인트는
    // com.coliving.common.comment 도메인 컨트롤러에서 처리합니다.

    private PostCommentResponseDto toCommentDto(Comment comment) {
        PostAuthorResponseDto author = PostAuthorResponseDto.builder()
                .userId(comment.getUserId())
                .name(null)
                .profileImage(null)
                .build();

        return PostCommentResponseDto.builder()
                .commentId(comment.getCommentId())
                .content(comment.getContent())
                .author(author)
                .createdAt(comment.getCreatedAt())
                .build();
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

        ActorRole role = extractRole(authentication);
        return new ActorInfo(actorId, role);
    }

    private ActorRole extractRole(Authentication authentication) {
        GrantedAuthority authority = authentication.getAuthorities().stream()
                .filter(a -> a != null && a.getAuthority() != null && a.getAuthority().startsWith("ROLE_"))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));

        String raw = authority.getAuthority(); // ROLE_ADMIN
        String role = raw.substring("ROLE_".length());
        try {
            return ActorRole.valueOf(role);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private PostCategory parseCategoryOrNull(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        return parseCategoryOrThrow(category);
    }

    private PostCategory parseCategoryOrThrow(String category) {
        try {
            return PostCategory.valueOf(category.trim());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
    }

    // attachments/links는 request body의 JSON 배열을 그대로 사용합니다.

    private static class ActorInfo {
        private final Long actorId;
        private final ActorRole role;

        private ActorInfo(Long actorId, ActorRole role) {
            this.actorId = actorId;
            this.role = role;
        }
    }
}

