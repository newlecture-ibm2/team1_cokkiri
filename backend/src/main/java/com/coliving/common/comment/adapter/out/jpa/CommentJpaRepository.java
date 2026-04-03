package com.coliving.common.comment.adapter.out.jpa;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentJpaRepository extends JpaRepository<CommentEntity, Long> {

    Optional<CommentEntity> findByCommentId(Long commentId);

    @EntityGraph(attributePaths = {"post"})
    List<CommentEntity> findByPost_PostId(Long postId, Sort sort);

    @EntityGraph(attributePaths = {"post"})
    List<CommentEntity> findByPost_PostId(Long postId);
}
