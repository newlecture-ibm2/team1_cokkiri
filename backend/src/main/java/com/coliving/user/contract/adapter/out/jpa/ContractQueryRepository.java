package com.coliving.user.contract.adapter.out.jpa;

import com.coliving.user.contract.model.ContractStatus;

import java.time.LocalDate;
import java.util.List;

public interface ContractQueryRepository {
    List<ContractEntity> searchContracts(Long userId, List<ContractStatus> statuses, LocalDate startDate,
            LocalDate endDate);
}
