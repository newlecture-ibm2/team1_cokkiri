package com.coliving.common.community.model;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
public class Post {
    private Long postId;
    private Long userId;
    private PostCategory category;
    private String title;
    private String content;
    private List<PostAttachment> attachments;
    private List<PostLink> links;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

