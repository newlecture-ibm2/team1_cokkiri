package com.coliving.common.voc.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
public class VocDetailResponseDto {
    private final Long vocId;
    private final Long userId;
    private final String category;
    private final String title;
    private final String content;
    private final List<VocAttachmentResponseDto> attachments;
    private final String status;
    private final String adminReply;
    private final Long replyUserId;
    private final OffsetDateTime repliedAt;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
