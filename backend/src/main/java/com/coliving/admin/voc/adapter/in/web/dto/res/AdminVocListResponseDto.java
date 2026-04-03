package com.coliving.admin.voc.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminVocListResponseDto {
    private final List<AdminVocListItemResponseDto> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
