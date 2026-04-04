package com.coliving.common.community.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ToggleLikeResponseDto {
    private final Long postId;
    private final boolean liked;
    private final Integer likeCount;
}

