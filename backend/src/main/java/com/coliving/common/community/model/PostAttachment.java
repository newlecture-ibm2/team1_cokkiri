package com.coliving.common.community.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostAttachment {
    private String fileUrl;
    private String fileName;
    private Long fileSize;
}

