package com.coliving.admin.voc.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class AdminVocListItemResponseDto {
    private final Long vocId;
    private final Long userId;
    private final String category;
    private final String title;
    private final String status;
    private final OffsetDateTime createdAt;
}
