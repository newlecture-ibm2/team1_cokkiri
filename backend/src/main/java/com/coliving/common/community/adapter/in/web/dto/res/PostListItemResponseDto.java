package com.coliving.common.community.adapter.in.web.dto.res;

import com.coliving.common.community.model.PostCategory;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class PostListItemResponseDto {
    private final Long postId;
    private final String category;
    private final String title;
    private final Long authorUserId;
    private final String authorName;
    private final Integer viewCount;
    private final Integer likeCount;
    private final Integer commentCount;
    private final OffsetDateTime createdAt;

    public static PostListItemResponseDto from(PostCategory category,
                                                Long postId,
                                                String title,
                                                Long authorUserId,
                                                Integer viewCount,
                                                Integer likeCount,
                                                Integer commentCount,
                                                OffsetDateTime createdAt) {
        return PostListItemResponseDto.builder()
                .postId(postId)
                .category(category != null ? category.name() : null)
                .title(title)
                .authorUserId(authorUserId)
                .authorName(null)
                .viewCount(viewCount)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .createdAt(createdAt)
                .build();
    }
}

