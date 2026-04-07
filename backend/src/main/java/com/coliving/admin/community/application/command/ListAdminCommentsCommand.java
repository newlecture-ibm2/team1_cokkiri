package com.coliving.admin.community.application.command;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class ListAdminCommentsCommand {
    private final Long postId;
    private final Long authorUserId;
    private final OffsetDateTime createdFrom;
    private final OffsetDateTime createdTo;
    private final int page;
    private final int size;
    private final String sort;
}
