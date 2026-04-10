package com.coliving.common.community.application.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NoticePublishedEvent {
    private final Long postId;
    private final String title;
}
