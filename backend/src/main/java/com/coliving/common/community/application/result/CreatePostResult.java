package com.coliving.common.community.application.result;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class CreatePostResult {
    private final Long postId;
    private final OffsetDateTime createdAt;
}

