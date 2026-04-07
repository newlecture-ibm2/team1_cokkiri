package com.coliving.admin.community.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class AdminPostListItemResponseDto {
    private final Long postId;
    private final String category;
    private final String title;
    private final Long authorUserId;
    private final Integer viewCount;
    private final Integer likeCount;
    private final Integer commentCount;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
