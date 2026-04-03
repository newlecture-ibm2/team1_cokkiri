package com.coliving.common.comment.application.port.out;

public interface PostCommentCountPort {

    void incrementCommentCount(Long postId);

    void decrementCommentCount(Long postId);

    void resetCommentCountToZero(Long postId);
}

