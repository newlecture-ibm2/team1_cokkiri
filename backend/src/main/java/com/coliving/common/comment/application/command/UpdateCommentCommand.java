package com.coliving.common.comment.application.command;

import com.coliving.common.community.model.ActorRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateCommentCommand {
    private final Long actorId;
    private final ActorRole actorRole;
    private final Long commentId;
    private final String content;
}

