package com.coliving.user.contract.application.port.out;

import com.coliving.user.contract.model.Contract;

import java.util.List;
import java.util.Optional;

public interface ContractRepositoryPort {
    Contract save(Contract contract);
    Optional<Contract> findById(Long id);
    Optional<Contract> findByUserIdAndSpaceId(Long userId, Long spaceId);
    List<Contract> findAllByUserId(Long userId);
}
