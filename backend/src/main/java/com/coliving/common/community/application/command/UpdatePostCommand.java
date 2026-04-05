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
public class UpdatePostCommand {
    private final Long actorId;
    private final ActorRole actorRole;
    private final Long postId;
    private final PostCategory category;
    private final String title;
    private final String content;
    /** null이면 기존 DB 첨부를 유지한 뒤 {@link #newFileAttachments}만 병합합니다. */
    private final List<PostAttachment> retainedAttachments;
    private final List<PostAttachment> newFileAttachments;
    private final List<PostLink> links;
}

