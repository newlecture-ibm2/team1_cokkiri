package com.coliving.user.history.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 활동 이력 목록 Result VO (페이징 포함)
 */
@Getter
@Builder
public class HistoryListResult {

    private List<HistoryItemResult> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
