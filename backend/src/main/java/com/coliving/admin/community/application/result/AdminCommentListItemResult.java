package com.coliving.admin.community.application.result;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class AdminCommentListItemResult {
    private final Long commentId;
    private final Long postId;
    private final String postTitle;
    private final Long authorUserId;
    private final String content;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
