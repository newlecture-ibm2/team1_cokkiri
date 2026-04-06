package com.coliving.admin.community.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminCommentListResponseDto {
    private final List<AdminCommentListItemResponseDto> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
