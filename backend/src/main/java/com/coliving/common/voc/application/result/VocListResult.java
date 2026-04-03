package com.coliving.common.voc.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class VocListResult {
    private final List<VocListItemResult> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
