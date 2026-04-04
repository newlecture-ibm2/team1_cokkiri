package com.coliving.common.community.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class PostIdResponseDto {
    private final Long postId;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}

