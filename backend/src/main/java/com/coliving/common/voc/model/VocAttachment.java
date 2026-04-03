package com.coliving.common.voc.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocAttachment {
    private String fileUrl;
    private String fileName;
    private Long fileSize;
}
