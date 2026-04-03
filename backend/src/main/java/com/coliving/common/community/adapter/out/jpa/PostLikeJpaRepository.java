package com.coliving.common.community.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeJpaRepository extends JpaRepository<PostLikeEntity, Long> {

    Optional<PostLikeEntity> findByPost_PostIdAndUserId(Long postId, Long userId);
}
