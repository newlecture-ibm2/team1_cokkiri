package com.coliving.common.community.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostEditorImageResponseDto {
    /** 브라우저·API 공통 규약: {@code /api/files/community/파일명} */
    private final String url;
}
