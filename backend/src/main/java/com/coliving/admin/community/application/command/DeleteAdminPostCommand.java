package com.coliving.admin.community.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DeleteAdminPostCommand {
    private final Long postId;
}
