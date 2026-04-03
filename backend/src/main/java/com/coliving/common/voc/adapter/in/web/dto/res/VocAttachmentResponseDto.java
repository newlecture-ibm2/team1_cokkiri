package com.coliving.common.voc.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VocAttachmentResponseDto {
    private final String fileUrl;
    private final String fileName;
    private final Long fileSize;
}
