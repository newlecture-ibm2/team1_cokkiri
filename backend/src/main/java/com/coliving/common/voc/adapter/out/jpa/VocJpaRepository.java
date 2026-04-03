package com.coliving.common.voc.adapter.out.jpa;

import com.coliving.common.voc.model.VocStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VocJpaRepository extends JpaRepository<VocEntity, Long> {

    Optional<VocEntity> findByVocIdAndUserId(Long vocId, Long userId);

    Page<VocEntity> findByUserId(Long userId, Pageable pageable);

    @Query("""
            SELECT v FROM VocEntity v
            WHERE (:status IS NULL OR v.status = :status)
            """)
    Page<VocEntity> findPageByOptionalStatus(@Param("status") VocStatus status, Pageable pageable);
}
