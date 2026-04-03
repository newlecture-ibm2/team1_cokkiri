package com.coliving.common.community.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostAuthorResponseDto {
    private final Long userId;
    private final String name;
    private final String profileImage;
}

