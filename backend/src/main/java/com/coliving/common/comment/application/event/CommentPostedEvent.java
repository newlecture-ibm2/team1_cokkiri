package com.coliving.common.comment.application.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 댓글 저장 커밋 이후 알림 발송용.
 */
@Getter
@RequiredArgsConstructor
public class CommentPostedEvent {
    private final Long postId;
    private final Long actorId;
    private final Long parentCommentId;
}
