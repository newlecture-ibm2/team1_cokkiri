package com.coliving.admin.voc.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminVocListResult {
    private final List<AdminVocListItemResult> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
