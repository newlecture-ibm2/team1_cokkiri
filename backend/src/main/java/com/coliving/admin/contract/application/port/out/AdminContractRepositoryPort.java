package com.coliving.admin.contract.application.port.out;

import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.model.ContractStatus;
import com.coliving.admin.contract.application.result.AdminContractListResult;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AdminContractRepositoryPort {

    /** PENDING 신청만 조회 */
    List<AdminContractListResult> findPendingContracts();

    /** 전체 계약 조회 (상태, 공간, 기간 필터 옵션) */
    List<AdminContractListResult> findAllContracts(ContractStatus status, Long spaceId, LocalDate startDate, LocalDate endDate);

    Optional<ContractEntity> findById(Long contractId);

    void save(ContractEntity entity);
}
