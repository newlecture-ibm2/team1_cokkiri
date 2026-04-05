package com.coliving.common.voc.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VocEditorImageResponseDto {
    /** {@code /api/files/voc/파일명} */
    private final String url;
}
