package com.coliving.common.community.application.result;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DeletePostResult {
    private final Long postId;
}

