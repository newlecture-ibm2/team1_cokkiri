package com.coliving.admin.community.application.command;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class ListAdminPostsCommand {
    private final String category;
    private final Long authorUserId;
    private final String keyword;
    private final OffsetDateTime createdFrom;
    private final OffsetDateTime createdTo;
    private final int page;
    private final int size;
    private final String sort;
}
