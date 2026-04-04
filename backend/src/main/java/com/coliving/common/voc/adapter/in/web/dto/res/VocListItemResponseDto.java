package com.coliving.common.voc.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class VocListItemResponseDto {
    private final Long vocId;
    private final String category;
    private final String title;
    private final String status;
    private final OffsetDateTime createdAt;
}
