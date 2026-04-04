package com.coliving.common.comment.application.port.out;

import com.coliving.common.community.model.Comment;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

public interface CommentRepositoryPort {

    List<Comment> findCommentsByPostId(Long postId, Sort sort);

    Optional<Comment> findCommentById(Long commentId);

    Comment createComment(Long postId, Long userId, String content);

    Comment updateComment(Long commentId, String content);

    void softDeleteComment(Long commentId);

    /**
     * 게시글 삭제 시 댓글도 함께 삭제(soft delete)하지만,
     * post.commentCount 조정은 community(포스트) 쪽에서 처리합니다.
     */
    void softDeleteCommentsByPostId(Long postId);
}

