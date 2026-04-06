package com.coliving.admin.community.adapter.in.web;

import com.coliving.admin.community.adapter.in.web.dto.res.AdminCommentDetailResponseDto;
import com.coliving.admin.community.adapter.in.web.dto.res.AdminCommentListItemResponseDto;
import com.coliving.admin.community.adapter.in.web.dto.res.AdminCommentListResponseDto;
import com.coliving.admin.community.adapter.in.web.dto.res.AdminPostDetailResponseDto;
import com.coliving.admin.community.adapter.in.web.dto.res.AdminPostListItemResponseDto;
import com.coliving.admin.community.adapter.in.web.dto.res.AdminPostListResponseDto;
import com.coliving.admin.community.application.command.DeleteAdminCommentCommand;
import com.coliving.admin.community.application.command.DeleteAdminPostCommand;
import com.coliving.admin.community.application.command.GetAdminCommentDetailCommand;
import com.coliving.admin.community.application.command.GetAdminPostDetailCommand;
import com.coliving.admin.community.application.command.ListAdminCommentsCommand;
import com.coliving.admin.community.application.command.ListAdminPostsCommand;
import com.coliving.admin.community.application.port.in.AdminCommunityUseCase;
import com.coliving.admin.community.application.result.AdminCommentDetailResult;
import com.coliving.admin.community.application.result.AdminCommentListItemResult;
import com.coliving.admin.community.application.result.AdminCommentListResult;
import com.coliving.admin.community.application.result.AdminPostDetailResult;
import com.coliving.admin.community.application.result.AdminPostListItemResult;
import com.coliving.admin.community.application.result.AdminPostListResult;
import com.coliving.global.dto.ApiResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/admin")
public class AdminCommunityController {
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Seoul");

    private final AdminCommunityUseCase adminCommunityUseCase;

    public AdminCommunityController(AdminCommunityUseCase adminCommunityUseCase) {
        this.adminCommunityUseCase = adminCommunityUseCase;
    }

    @GetMapping("/posts")
    public ApiResponse<AdminPostListResponseDto> listPosts(
            @RequestParam(required = false) String category,
            @RequestParam(value = "author_user_id", required = false) Long authorUserId,
            @RequestParam(required = false) String keyword,
            @RequestParam(value = "created_from", required = false) LocalDate createdFrom,
            @RequestParam(value = "created_to", required = false) LocalDate createdTo,
            @RequestParam(value = "p", defaultValue = "0") int page,
            @RequestParam(value = "s", defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort
    ) {
        OffsetDateTime fromAt = toStartOfDay(createdFrom);
        OffsetDateTime toAt = toEndOfDay(createdTo);
        AdminPostListResult result = adminCommunityUseCase.listPosts(ListAdminPostsCommand.builder()
                .category(category)
                .authorUserId(authorUserId)
                .keyword(keyword)
                .createdFrom(fromAt)
                .createdTo(toAt)
                .page(page)
                .size(size)
                .sort(sort)
                .build());

        return ApiResponse.ok(AdminPostListResponseDto.builder()
                .content(result.getContent().stream().map(this::toPostListItemDto).toList())
                .page(result.getPage())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build());
    }

    @GetMapping("/posts/{postId}")
    public ApiResponse<AdminPostDetailResponseDto> getPostDetail(@PathVariable Long postId) {
        AdminPostDetailResult result = adminCommunityUseCase.getPostDetail(GetAdminPostDetailCommand.builder()
                .postId(postId)
                .build());
        return ApiResponse.ok(toPostDetailDto(result));
    }

    @DeleteMapping("/posts/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable Long postId) {
        adminCommunityUseCase.deletePost(DeleteAdminPostCommand.builder().postId(postId).build());
        return ApiResponse.ok(null, "게시글이 삭제되었습니다.");
    }

    @GetMapping("/comments")
    public ApiResponse<AdminCommentListResponseDto> listComments(
            @RequestParam(value = "post_id", required = false) Long postId,
            @RequestParam(value = "author_user_id", required = false) Long authorUserId,
            @RequestParam(value = "created_from", required = false) LocalDate createdFrom,
            @RequestParam(value = "created_to", required = false) LocalDate createdTo,
            @RequestParam(value = "p", defaultValue = "0") int page,
            @RequestParam(value = "s", defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort
    ) {
        OffsetDateTime fromAt = toStartOfDay(createdFrom);
        OffsetDateTime toAt = toEndOfDay(createdTo);
        AdminCommentListResult result = adminCommunityUseCase.listComments(ListAdminCommentsCommand.builder()
                .postId(postId)
                .authorUserId(authorUserId)
                .createdFrom(fromAt)
                .createdTo(toAt)
                .page(page)
                .size(size)
                .sort(sort)
                .build());

        return ApiResponse.ok(AdminCommentListResponseDto.builder()
                .content(result.getContent().stream().map(this::toCommentListItemDto).toList())
                .page(result.getPage())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build());
    }

    @GetMapping("/comments/{commentId}")
    public ApiResponse<AdminCommentDetailResponseDto> getCommentDetail(@PathVariable Long commentId) {
        AdminCommentDetailResult result = adminCommunityUseCase.getCommentDetail(GetAdminCommentDetailCommand.builder()
                .commentId(commentId)
                .build());
        return ApiResponse.ok(toCommentDetailDto(result));
    }

    @DeleteMapping("/comments/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long commentId) {
        adminCommunityUseCase.deleteComment(DeleteAdminCommentCommand.builder().commentId(commentId).build());
        return ApiResponse.ok(null, "댓글이 삭제되었습니다.");
    }

    private AdminPostListItemResponseDto toPostListItemDto(AdminPostListItemResult r) {
        return AdminPostListItemResponseDto.builder()
                .postId(r.getPostId())
                .category(r.getCategory())
                .title(r.getTitle())
                .authorUserId(r.getAuthorUserId())
                .viewCount(r.getViewCount())
                .likeCount(r.getLikeCount())
                .commentCount(r.getCommentCount())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private AdminPostDetailResponseDto toPostDetailDto(AdminPostDetailResult r) {
        return AdminPostDetailResponseDto.builder()
                .postId(r.getPostId())
                .category(r.getCategory())
                .title(r.getTitle())
                .content(r.getContent())
                .authorUserId(r.getAuthorUserId())
                .attachments(r.getAttachments())
                .links(r.getLinks())
                .viewCount(r.getViewCount())
                .likeCount(r.getLikeCount())
                .commentCount(r.getCommentCount())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private AdminCommentListItemResponseDto toCommentListItemDto(AdminCommentListItemResult r) {
        return AdminCommentListItemResponseDto.builder()
                .commentId(r.getCommentId())
                .postId(r.getPostId())
                .postTitle(r.getPostTitle())
                .authorUserId(r.getAuthorUserId())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private AdminCommentDetailResponseDto toCommentDetailDto(AdminCommentDetailResult r) {
        return AdminCommentDetailResponseDto.builder()
                .commentId(r.getCommentId())
                .postId(r.getPostId())
                .postTitle(r.getPostTitle())
                .authorUserId(r.getAuthorUserId())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private OffsetDateTime toStartOfDay(LocalDate date) {
        if (date == null) {
            return null;
        }
        return date.atStartOfDay(DEFAULT_ZONE).toOffsetDateTime();
    }

    private OffsetDateTime toEndOfDay(LocalDate date) {
        if (date == null) {
            return null;
        }
        return date.plusDays(1).atStartOfDay(DEFAULT_ZONE).minusNanos(1).toOffsetDateTime();
    }
}
