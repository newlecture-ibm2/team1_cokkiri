package com.coliving.user.contract.adapter.out.jpa;

import com.coliving.user.contract.model.ContractStatus;
import java.time.LocalDate;
import java.util.List;

/**
 * Contract QueryDSL Repository Interface
 * DoD 만족을 위한 Fetch Join 적용 (N+1 방지)
 */
public interface ContractQueryRepository {
    
    /**
     * 특정 상태 및 날짜 범위 내의 계약 목록 조회 (N+1 방지 Fetch Join 포함)
     */
    List<ContractEntity> searchContracts(Long userId, List<ContractStatus> statuses, LocalDate startDate, LocalDate endDate);
}
