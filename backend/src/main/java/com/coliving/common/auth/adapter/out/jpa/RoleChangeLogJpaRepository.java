package com.coliving.common.auth.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * ROLE_CHANGE_LOG 테이블 JPA Repository
 */
public interface RoleChangeLogJpaRepository extends JpaRepository<RoleChangeLogEntity, Long> {

    /**
     * 사용자 ID로 역할 변경 이력 조회 (최신순)
     */
    List<RoleChangeLogEntity> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 계약 ID로 역할 변경 이력 조회
     */
    List<RoleChangeLogEntity> findByContractId(Long contractId);
}
