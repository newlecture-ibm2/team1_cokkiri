package com.coliving.common;

import com.coliving.common.comment.adapter.out.jpa.CommentEntity;
import com.coliving.common.comment.adapter.out.jpa.CommentJpaRepository;
import com.coliving.common.community.adapter.out.jpa.PostEntity;
import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * {@link org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest} 슬라이스에서
 * 게시글·댓글 JPA만 스캔합니다 (H2 테스트 시 voc/notification 등 전체 스키마 충돌 방지).
 */
@TestConfiguration
@EntityScan(basePackageClasses = {CommentEntity.class, PostEntity.class})
@EnableJpaRepositories(basePackageClasses = {CommentJpaRepository.class, PostJpaRepository.class})
public class CommunityJpaTestConfiguration {
}
