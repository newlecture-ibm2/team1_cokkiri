package com.coliving.common.community.adapter.out.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PostJpaRepository extends JpaRepository<PostEntity, Long> {

    Page<PostEntity> findByCategory(String category, Pageable pageable);

    /**
     * 전체 목록: 공지(NOTICE)를 항상 앞에 두고, 그다음 최신순(createdAt DESC).
     * Pageable에는 Sort를 넣지 않습니다(Spring이 ORDER BY와 충돌하지 않도록 unsorted).
     */
    @Query(
            value = """
                    SELECT p FROM PostEntity p
                    ORDER BY CASE WHEN p.category = 'NOTICE' THEN 0 ELSE 1 END ASC,
                             p.createdAt DESC
                    """,
            countQuery = "SELECT COUNT(p) FROM PostEntity p"
    )
    Page<PostEntity> findAllNoticeFirst(Pageable pageable);
}

