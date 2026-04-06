package com.coliving.common.community.adapter.in.web.dto.res;

import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.community.model.PostLink;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
public class PostDetailResponseDto {
    private final Long postId;
    private final String category;
    private final String title;
    private final String content;
    private final List<PostAttachment> attachments;
    private final List<PostLink> links;
    private final Integer viewCount;
    private final Integer likeCount;
    private final Integer commentCount;
    private final boolean isLikedByMe;
    private final PostAuthorResponseDto author;
    private final List<PostCommentResponseDto> comments;
    private final OffsetDateTime createdAt;
}
