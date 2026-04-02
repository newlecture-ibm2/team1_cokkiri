package com.coliving.common.community.model;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class Comment {
    private Long commentId;
    private Long postId;
    private Long userId;
    private String content;
    private OffsetDateTime createdAt;
}

