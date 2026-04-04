package com.coliving.common.community.application.result;

import com.coliving.common.community.model.Comment;
import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.community.model.PostCategory;
import com.coliving.common.community.model.PostLink;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
public class PostDetailResult {
    private final Long postId;
    private final PostCategory category;
    private final String title;
    private final String content;
    private final List<PostAttachment> attachments;
    private final List<PostLink> links;
    private final Integer viewCount;
    private final Integer likeCount;
    private final Integer commentCount;
    private final boolean likedByMe;
    private final Long authorUserId;
    private final List<Comment> comments;
    private final OffsetDateTime createdAt;
}

