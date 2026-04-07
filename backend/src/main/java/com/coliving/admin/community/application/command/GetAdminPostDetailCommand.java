package com.coliving.admin.community.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetAdminPostDetailCommand {
    private final Long postId;
}
