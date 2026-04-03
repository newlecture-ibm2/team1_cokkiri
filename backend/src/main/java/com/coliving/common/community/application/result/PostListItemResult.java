package com.coliving.common.community.application.result;

import com.coliving.common.community.model.PostCategory;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class PostListItemResult {
    private final Long postId;
    private final PostCategory category;
    private final String title;
    private final Long authorUserId;
    private final Integer viewCount;
    private final Integer likeCount;
    private final Integer commentCount;
    private final OffsetDateTime createdAt;
}

