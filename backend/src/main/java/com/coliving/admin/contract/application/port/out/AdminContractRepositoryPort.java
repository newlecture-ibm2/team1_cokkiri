package com.coliving.admin.contract.application.port.out;

import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.admin.contract.application.result.AdminContractListResult;

import java.util.List;
import java.util.Optional;

public interface AdminContractRepositoryPort {
    List<AdminContractListResult> findPendingContracts();
    Optional<ContractEntity> findById(Long contractId);
    void save(ContractEntity entity);
}
