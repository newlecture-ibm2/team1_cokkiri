package com.coliving.common.voc.model;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
public class Voc {
    private final Long vocId;
    private final Long userId;
    private final VocCategory category;
    private final String title;
    private final String content;
    private final List<VocAttachment> attachments;
    private final VocStatus status;
    private final String adminReply;
    private final Long replyUserId;
    private final OffsetDateTime repliedAt;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
