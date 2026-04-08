package com.coliving.common.voc.adapter.out.jpa;

import com.coliving.common.voc.model.VocStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VocJpaRepository extends JpaRepository<VocEntity, Long> {

    Optional<VocEntity> findByVocIdAndUserId(Long vocId, Long userId);

    Page<VocEntity> findByUserId(Long userId, Pageable pageable);

    @Query("""
            SELECT v FROM VocEntity v
            WHERE (:status IS NULL OR v.status = :status)
            """)
    Page<VocEntity> findPageByOptionalStatus(@Param("status") VocStatus status, Pageable pageable);

    /** 미처리(접수·처리 중): OPEN을 먼저, 그다음 IN_PROGRESS(문자열 정렬과 무관하게 고정) */
    @Query(
            value = """
                    SELECT v FROM VocEntity v
                    WHERE v.status IN :statuses
                    ORDER BY CASE WHEN v.status = com.coliving.common.voc.model.VocStatus.OPEN THEN 0 ELSE 1 END,
                             v.createdAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(v) FROM VocEntity v
                    WHERE v.status IN :statuses
                    """
    )
    Page<VocEntity> findPageByStatusInPendingOrder(@Param("statuses") List<VocStatus> statuses, Pageable pageable);
}
