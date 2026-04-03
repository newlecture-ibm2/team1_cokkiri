package com.coliving.common.comment.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class CommentMutationResponseDto {
    private final Long commentId;
    private final Long postId;
    private final OffsetDateTime createdAt;
}

