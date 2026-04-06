package com.coliving.admin.community.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminCommentListResult {
    private final List<AdminCommentListItemResult> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
