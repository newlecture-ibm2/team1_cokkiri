package com.coliving.common.community.application.command;

import com.coliving.common.community.model.ActorRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetPostDetailCommand {
    private final Long actorId;
    private final ActorRole actorRole;
    private final Long postId;
}

