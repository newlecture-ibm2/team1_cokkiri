package com.coliving.common.community.application.command;

import com.coliving.common.community.model.ActorRole;
import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.community.model.PostCategory;
import com.coliving.common.community.model.PostLink;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CreatePostCommand {
    private final Long actorId;
    private final ActorRole actorRole;
    private final PostCategory category;
    private final String title;
    private final String content;
    private final List<PostAttachment> attachments;
    private final List<PostLink> links;
}

