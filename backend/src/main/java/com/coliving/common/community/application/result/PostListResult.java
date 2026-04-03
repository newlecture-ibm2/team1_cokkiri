package com.coliving.common.community.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PostListResult {
    private final List<PostListItemResult> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}

