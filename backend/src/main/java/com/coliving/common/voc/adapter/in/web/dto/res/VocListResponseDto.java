package com.coliving.common.voc.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class VocListResponseDto {
    private final List<VocListItemResponseDto> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
