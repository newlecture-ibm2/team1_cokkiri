package com.coliving.common.community.application.result;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class CommentResult {
    private final Long commentId;
    private final Long postId;
    private final OffsetDateTime createdAt;
}

