package com.coliving.admin.community.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListAdminCommentsCommand {
    private final Long postId;
    private final Long authorUserId;
    private final int page;
    private final int size;
    private final String sort;
}
