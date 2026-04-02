package com.coliving.common.community.application.result;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ToggleLikeResult {
    private final Long postId;
    private final boolean liked;
    private final Integer likeCount;
}

