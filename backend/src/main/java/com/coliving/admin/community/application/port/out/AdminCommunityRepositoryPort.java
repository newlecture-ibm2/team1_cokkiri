package com.coliving.admin.community.application.port.out;

import com.coliving.admin.community.application.result.AdminCommentDetailResult;
import com.coliving.admin.community.application.result.AdminCommentListItemResult;
import com.coliving.admin.community.application.result.AdminPostDetailResult;
import com.coliving.admin.community.application.result.AdminPostListItemResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface AdminCommunityRepositoryPort {
    Page<AdminPostListItemResult> findPosts(
            String category,
            Long authorUserId,
            String keyword,
            OffsetDateTime createdFrom,
            OffsetDateTime createdTo,
            Pageable pageable
    );

    Optional<AdminPostDetailResult> findPostDetail(Long postId);

    Page<AdminCommentListItemResult> findComments(
            Long postId,
            Long authorUserId,
            OffsetDateTime createdFrom,
            OffsetDateTime createdTo,
            Pageable pageable
    );

    Optional<AdminCommentDetailResult> findCommentDetail(Long commentId);
}
