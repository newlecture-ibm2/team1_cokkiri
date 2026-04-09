package com.coliving.user.contract.adapter.out.persistence;

import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.application.port.out.ContractRepositoryPort;
import com.coliving.user.contract.model.Contract;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ContractPersistenceAdapter implements ContractRepositoryPort {

    private final ContractJpaRepository jpaRepository;

    @Override
    public List<Contract> findAllByUserId(Long userId) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public Contract save(Contract contract) {
        ContractEntity entity = toEntity(contract);
        return toModel(jpaRepository.save(entity));
    }

    @Override
    public Optional<Contract> findById(Long id) {
        return jpaRepository.findById(id).map(this::toModel);
    }

    @Override
    public Optional<Contract> findByUserIdAndSpaceId(Long userId, Long spaceId) {
        return jpaRepository.findByUserIdAndSpaceId(userId, spaceId).map(this::toModel);
    }

    @Override
    public Optional<Contract> findDraftByUserIdAndSpaceId(Long userId, Long spaceId) {
        return jpaRepository.findByUserIdAndSpaceIdAndStatus(userId, spaceId, 
                com.coliving.user.contract.model.ContractStatus.DRAFT).map(this::toModel);
    }

    private ContractEntity toEntity(Contract model) {
        return ContractEntity.builder()
                .contractId(model.getContractId())
                .version(model.getVersion())
                .userId(model.getUserId())
                .spaceId(model.getSpaceId())
                .origin(model.getOrigin())
                .status(model.getStatus())
                .address(model.getAddress())
                .bankAccount(model.getBankAccount())
                .desiredStartDate(model.getDesiredStartDate())
                .desiredDurationMonths(model.getDesiredDurationMonths())
                .contractLanguage(model.getContractLanguage())
                .privacyAgreed(model.getPrivacyAgreed())
                .usagePurpose(model.getUsagePurpose())
                .requestNote(model.getRequestNote())
                .startDate(model.getStartDate())
                .endDate(model.getEndDate())
                .monthlyRent(model.getMonthlyRent())
                .deposit(model.getDeposit())
                .specialTerms(model.getSpecialTerms())
                .approvedBy(model.getApprovedBy())
                .rejectedReason(model.getRejectedReason())
                .contractedAt(model.getContractedAt())
                .build();
    }

    private Contract toModel(ContractEntity entity) {
        return Contract.builder()
                .contractId(entity.getContractId())
                .version(entity.getVersion())
                .userId(entity.getUserId())
                .spaceId(entity.getSpaceId())
                .origin(entity.getOrigin())
                .status(entity.getStatus())
                .address(entity.getAddress())
                .bankAccount(entity.getBankAccount())
                .desiredStartDate(entity.getDesiredStartDate())
                .desiredDurationMonths(entity.getDesiredDurationMonths())
                .contractLanguage(entity.getContractLanguage())
                .privacyAgreed(entity.getPrivacyAgreed())
                .usagePurpose(entity.getUsagePurpose())
                .requestNote(entity.getRequestNote())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .monthlyRent(entity.getMonthlyRent())
                .deposit(entity.getDeposit())
                .specialTerms(entity.getSpecialTerms())
                .approvedBy(entity.getApprovedBy())
                .rejectedReason(entity.getRejectedReason())
                .contractedAt(entity.getContractedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
