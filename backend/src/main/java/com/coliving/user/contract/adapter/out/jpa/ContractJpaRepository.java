package com.coliving.user.contract.adapter.out.jpa;

import com.coliving.user.contract.model.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Contract JPA Repository
 */
public interface ContractJpaRepository extends JpaRepository<ContractEntity, Long> {

    /**
     * 특정 유저의 특정 공간 계약 조회
     */
    Optional<ContractEntity> findByUserIdAndSpaceId(Long userId, Long spaceId);

    /**
     * 특정 유저의 계약 목록 조회 (최신순)
     */
    List<ContractEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 특정 유저의 특정 상태 계약 목록 조회
     */
    List<ContractEntity> findByUserIdAndStatus(Long userId, ContractStatus status);

    /**
     * 특정 공간의 ACTIVE 계약 조회 (한 호실에 하나의 활성 계약만 존재)
     */
    Optional<ContractEntity> findBySpaceIdAndStatus(Long spaceId, ContractStatus status);

    /**
     * 특정 유저에게 진행 중인 신청(DRAFT, PENDING)이 있는지 확인
     */
    boolean existsByUserIdAndStatusIn(Long userId, List<ContractStatus> statuses);

    /**
     * 특정 공간에 ACTIVE 계약이 존재하는지 확인
     */
    boolean existsBySpaceIdAndStatus(Long spaceId, ContractStatus status);

    /**
     * 특정 상태의 모든 계약 목록 조회 (관리자용)
     */
    List<ContractEntity> findByStatus(ContractStatus status);
}
