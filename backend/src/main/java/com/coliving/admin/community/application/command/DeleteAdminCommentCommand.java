package com.coliving.admin.community.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DeleteAdminCommentCommand {
    private final Long commentId;
}
