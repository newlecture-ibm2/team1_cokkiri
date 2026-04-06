package com.coliving.admin.community.application.service;

import com.coliving.admin.community.application.command.DeleteAdminCommentCommand;
import com.coliving.admin.community.application.command.DeleteAdminPostCommand;
import com.coliving.admin.community.application.command.GetAdminCommentDetailCommand;
import com.coliving.admin.community.application.command.GetAdminPostDetailCommand;
import com.coliving.admin.community.application.command.ListAdminCommentsCommand;
import com.coliving.admin.community.application.command.ListAdminPostsCommand;
import com.coliving.admin.community.application.port.in.AdminCommunityUseCase;
import com.coliving.admin.community.application.port.out.AdminCommunityRepositoryPort;
import com.coliving.admin.community.application.result.AdminCommentDetailResult;
import com.coliving.admin.community.application.result.AdminCommentListItemResult;
import com.coliving.admin.community.application.result.AdminCommentListResult;
import com.coliving.admin.community.application.result.AdminPostDetailResult;
import com.coliving.admin.community.application.result.AdminPostListItemResult;
import com.coliving.admin.community.application.result.AdminPostListResult;
import com.coliving.common.community.application.port.out.CommunityRepositoryPort;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class AdminCommunityService implements AdminCommunityUseCase {
    private static final Set<String> ALLOWED_POST_SORT_PROPERTIES = Set.of(
            "createdAt", "updatedAt", "viewCount", "likeCount", "commentCount"
    );
    private static final Set<String> ALLOWED_COMMENT_SORT_PROPERTIES = Set.of(
            "createdAt", "updatedAt"
    );

    private final AdminCommunityRepositoryPort adminCommunityRepositoryPort;
    private final CommunityRepositoryPort communityRepositoryPort;

    public AdminCommunityService(AdminCommunityRepositoryPort adminCommunityRepositoryPort,
                                 CommunityRepositoryPort communityRepositoryPort) {
        this.adminCommunityRepositoryPort = adminCommunityRepositoryPort;
        this.communityRepositoryPort = communityRepositoryPort;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminPostListResult listPosts(ListAdminPostsCommand command) {
        int safePage = Math.max(0, command.getPage());
        int safeSize = normalizeSize(command.getSize());
        Sort sort = parseSort(command.getSort(), ALLOWED_POST_SORT_PROPERTIES);

        Page<AdminPostListItemResult> page = adminCommunityRepositoryPort.findPosts(
                command.getCategory(),
                command.getAuthorUserId(),
                command.getKeyword(),
                PageRequest.of(safePage, safeSize, sort)
        );

        return AdminPostListResult.builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminPostDetailResult getPostDetail(GetAdminPostDetailCommand command) {
        return adminCommunityRepositoryPort.findPostDetail(command.getPostId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }

    @Override
    @Transactional
    public void deletePost(DeleteAdminPostCommand command) {
        communityRepositoryPort.softDeletePost(command.getPostId());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminCommentListResult listComments(ListAdminCommentsCommand command) {
        int safePage = Math.max(0, command.getPage());
        int safeSize = normalizeSize(command.getSize());
        Sort sort = parseSort(command.getSort(), ALLOWED_COMMENT_SORT_PROPERTIES);

        Page<AdminCommentListItemResult> page = adminCommunityRepositoryPort.findComments(
                command.getPostId(),
                command.getAuthorUserId(),
                PageRequest.of(safePage, safeSize, sort)
        );

        return AdminCommentListResult.builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminCommentDetailResult getCommentDetail(GetAdminCommentDetailCommand command) {
        return adminCommunityRepositoryPort.findCommentDetail(command.getCommentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }

    @Override
    @Transactional
    public void deleteComment(DeleteAdminCommentCommand command) {
        communityRepositoryPort.softDeleteComment(command.getCommentId());
    }

    private int normalizeSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 100);
    }

    private Sort parseSort(String sort, Set<String> allowedSortProperties) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",");
        if (parts.length != 2) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String property = parts[0].trim();
        Sort.Direction direction = "asc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        String safeProperty = property.isBlank() ? "createdAt" : property;
        if (!allowedSortProperties.contains(safeProperty)) {
            safeProperty = "createdAt";
        }
        return Sort.by(direction, safeProperty);
    }
}
