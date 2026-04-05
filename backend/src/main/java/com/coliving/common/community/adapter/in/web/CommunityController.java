package com.coliving.common.community.adapter.in.web;

import com.coliving.common.community.adapter.in.web.dto.req.PostMultipartRequestDto;
import com.coliving.common.community.adapter.in.web.dto.req.PostUpdateMultipartRequestDto;
import com.coliving.common.community.application.command.*;
import com.coliving.common.community.application.port.in.CommunityUseCase;
import com.coliving.common.community.application.result.*;
import com.coliving.common.community.adapter.in.web.dto.res.*;
import com.coliving.common.community.model.ActorRole;
import com.coliving.common.community.model.Comment;
import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.community.model.PostCategory;
import com.coliving.common.community.model.PostLink;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.json.MultipartRetainedJsonParser;
import com.coliving.global.storage.LocalMultipartFileStorage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class CommunityController {

    private final CommunityUseCase useCase;
    private final LocalMultipartFileStorage multipartFileStorage;
    private final ObjectMapper objectMapper;

    public CommunityController(CommunityUseCase useCase,
                             LocalMultipartFileStorage multipartFileStorage,
                             ObjectMapper objectMapper) {
        this.useCase = useCase;
        this.multipartFileStorage = multipartFileStorage;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/api/posts")
    public ApiResponse<PostListResponseDto> getPostList(
            @RequestParam(required = false) String category,
            @RequestParam(value = "p", defaultValue = "0") int page,
            @RequestParam(value = "s", defaultValue = "20") int size,
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

    @PostMapping(value = "/api/posts/upload-editor-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PostEditorImageResponseDto> uploadEditorImage(@RequestPart("file") MultipartFile file) {
        getActorInfo();
        PostAttachment stored = multipartFileStorage.storeSinglePostImage(file);
        PostEditorImageResponseDto dto = PostEditorImageResponseDto.builder()
                .url(stored.getFileUrl())
                .build();
        return ApiResponse.ok(dto);
    }

    @PostMapping(value = "/api/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PostIdResponseDto> createPost(@Valid @ModelAttribute PostMultipartRequestDto form) {
        ActorInfo actor = getActorInfo();
        PostCategory category = parseCategoryOrThrow(form.getCategory());
        List<PostAttachment> attachments = multipartFileStorage.storePostFiles(form.getFiles());

        CreatePostCommand command = CreatePostCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.role)
                .category(category)
                .title(form.getTitle())
                .content(form.getContent())
                .attachments(attachments)
                .links(toPostLinks(form.getLinks()))
                .build();

        CreatePostResult result = useCase.createPost(command);

        PostIdResponseDto response = PostIdResponseDto.builder()
                .postId(result.getPostId())
                .createdAt(result.getCreatedAt())
                .updatedAt(null)
                .build();

        return ApiResponse.ok(response);
    }

    @PutMapping(value = "/api/posts/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PostIdResponseDto> updatePost(
            @PathVariable Long postId,
            @Valid @ModelAttribute PostUpdateMultipartRequestDto form
    ) {
        ActorInfo actor = getActorInfo();
        PostCategory category = parseCategoryOrThrow(form.getCategory());
        List<PostAttachment> retained = MultipartRetainedJsonParser.parseListOrNull(
                form.getAttachmentsJson(), objectMapper, new TypeReference<List<PostAttachment>>() {});
        List<PostAttachment> newFiles = multipartFileStorage.storePostFiles(form.getFiles());

        UpdatePostCommand command = UpdatePostCommand.builder()
                .actorId(actor.actorId)
                .actorRole(actor.role)
                .postId(postId)
                .category(category)
                .title(form.getTitle())
                .content(form.getContent())
                .retainedAttachments(retained)
                .newFileAttachments(newFiles.isEmpty() ? null : newFiles)
                .links(toPostLinks(form.getLinks()))
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

    private List<PostLink> toPostLinks(List<String> links) {
        if (links == null) {
            return List.of();
        }
        return links.stream()
                .filter(StringUtils::hasText)
                .map(u -> PostLink.builder().url(u.trim()).build())
                .toList();
    }

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

        long actorId;
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

        String raw = authority.getAuthority();
        String roleName = raw.substring("ROLE_".length());
        try {
            return ActorRole.valueOf(roleName);
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

    private static class ActorInfo {
        private final Long actorId;
        private final ActorRole role;

        private ActorInfo(Long actorId, ActorRole role) {
            this.actorId = actorId;
            this.role = role;
        }
    }
}
