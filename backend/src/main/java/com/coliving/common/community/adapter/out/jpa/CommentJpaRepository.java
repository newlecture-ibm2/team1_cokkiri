package com.coliving.common.community.adapter.out.jpa;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentJpaRepository extends JpaRepository<CommentEntity, Long> {

    Optional<CommentEntity> findByCommentId(Long commentId);

    List<CommentEntity> findByPostId(Long postId, Sort sort);
}

