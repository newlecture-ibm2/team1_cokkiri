package com.coliving.common.community.application.result;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class UpdatePostResult {
    private final Long postId;
    private final OffsetDateTime updatedAt;
}

