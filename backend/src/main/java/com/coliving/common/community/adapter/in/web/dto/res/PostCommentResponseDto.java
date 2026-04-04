package com.coliving.common.community.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class PostCommentResponseDto {
    private final Long commentId;
    private final String content;
    private final PostAuthorResponseDto author;
    private final OffsetDateTime createdAt;
}

