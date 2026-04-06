package com.coliving.admin.community.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListAdminPostsCommand {
    private final String category;
    private final Long authorUserId;
    private final String keyword;
    private final int page;
    private final int size;
    private final String sort;
}
