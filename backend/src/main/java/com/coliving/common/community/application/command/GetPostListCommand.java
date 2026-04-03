package com.coliving.common.community.application.command;

import com.coliving.common.community.model.ActorRole;
import com.coliving.common.community.model.PostCategory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetPostListCommand {
    private final Long actorId;
    private final ActorRole actorRole;
    private final PostCategory category;
    private final int page;
    private final int size;
    private final String sort;
}

