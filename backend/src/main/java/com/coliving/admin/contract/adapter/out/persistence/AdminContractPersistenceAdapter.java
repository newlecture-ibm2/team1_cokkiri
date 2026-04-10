package com.coliving.admin.contract.adapter.out.persistence;

import com.coliving.admin.contract.application.port.out.AdminContractRepositoryPort;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractStatus;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AdminContractPersistenceAdapter implements AdminContractRepositoryPort {

    private final ContractJpaRepository contractJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final SpaceJpaRepository spaceJpaRepository;

    @Override
    public List<AdminContractListResult> findPendingContracts() {
        List<ContractEntity> pendingContracts = contractJpaRepository.findByStatus(ContractStatus.PENDING);
        return toResultList(pendingContracts);
    }

    @Override
    public List<AdminContractListResult> findAllContracts(ContractStatus status) {
        List<ContractEntity> contracts;
        if (status != null) {
            contracts = contractJpaRepository.findByStatus(status);
        } else {
            contracts = contractJpaRepository.findAll();
        }
        return toResultList(contracts);
    }

    private List<AdminContractListResult> toResultList(List<ContractEntity> contracts) {
        if (contracts.isEmpty())
            return Collections.emptyList();

        List<Long> userIds = contracts.stream().map(ContractEntity::getUserId).distinct().collect(Collectors.toList());
        List<Long> spaceIds = contracts.stream().map(ContractEntity::getSpaceId).distinct()
                .collect(Collectors.toList());

        Map<Long, String> userNames = userJpaRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserEntity::getUserId, UserEntity::getName));
        Map<Long, String> spaceNames = spaceJpaRepository.findAllById(spaceIds).stream()
                .collect(Collectors.toMap(SpaceEntity::getSpaceId, SpaceEntity::getName));

        return contracts.stream()
                .map(c -> AdminContractListResult.builder()
                        .contractId(c.getContractId())
                        .userId(c.getUserId())
                        .userName(userNames.getOrDefault(c.getUserId(), "Unknown"))
                        .spaceId(c.getSpaceId())
                        .spaceName(spaceNames.getOrDefault(c.getSpaceId(), "Unknown"))
                        .status(c.getStatus())
                        .origin(c.getOrigin())
                        .desiredStartDate(c.getDesiredStartDate())
                        .desiredDurationMonths(c.getDesiredDurationMonths())
                        .address(c.getAddress())
                        .bankAccount(c.getBankAccount())
                        .usagePurpose(c.getUsagePurpose())
                        .requestNote(c.getRequestNote())
                        .startDate(c.getStartDate())
                        .endDate(c.getEndDate())
                        .monthlyRent(c.getMonthlyRent())
                        .deposit(c.getDeposit())
                        .specialTerms(c.getSpecialTerms())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ContractEntity> findById(Long contractId) {
        return contractJpaRepository.findById(contractId);
    }

    @Override
    public void save(ContractEntity entity) {
        contractJpaRepository.save(entity);
    }
}
