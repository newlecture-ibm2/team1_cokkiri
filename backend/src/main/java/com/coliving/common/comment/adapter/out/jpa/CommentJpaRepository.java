package com.coliving.common.comment.adapter.out.jpa;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CommentJpaRepository extends JpaRepository<CommentEntity, Long>, JpaSpecificationExecutor<CommentEntity> {

    Optional<CommentEntity> findByCommentId(Long commentId);

    Optional<CommentEntity> findByCommentIdAndPost_PostId(Long commentId, Long postId);

    boolean existsByParentComment_CommentId(Long parentCommentId);

    @EntityGraph(attributePaths = {"post"})
    List<CommentEntity> findByPost_PostId(Long postId, Sort sort);

    @EntityGraph(attributePaths = {"post"})
    List<CommentEntity> findByPost_PostId(Long postId);

    @Override
    @EntityGraph(attributePaths = {"post"})
    Optional<CommentEntity> findById(Long commentId);
}
