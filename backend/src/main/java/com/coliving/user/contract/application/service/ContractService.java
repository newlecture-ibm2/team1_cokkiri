package com.coliving.user.contract.application.service;

import com.coliving.user.contract.application.command.ContractApplyCommand;
import com.coliving.user.contract.application.port.in.ContractUseCase;
import com.coliving.user.contract.application.port.out.ContractRepositoryPort;
import com.coliving.user.contract.application.result.ContractResult;
import com.coliving.user.contract.model.Contract;
import com.coliving.user.contract.model.ContractOrigin;
import com.coliving.user.contract.model.ContractStatus;
import com.coliving.user.contract.application.result.ContractDraftResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContractService implements ContractUseCase {

    private final ContractRepositoryPort contractRepositoryPort;

    @Override
    public ContractDraftResult getDraft(Long userId, Long spaceId) {
        return contractRepositoryPort.findByUserIdAndSpaceId(userId, spaceId)
                .filter(c -> c.getStatus() == ContractStatus.DRAFT)
                .map(c -> ContractDraftResult.builder()
                        .contractId(c.getContractId())
                        .spaceId(c.getSpaceId())
                        .status(c.getStatus())
                        .desiredStartDate(c.getDesiredStartDate())
                        .desiredDurationMonths(c.getDesiredDurationMonths())
                        .address(c.getAddress())
                        .bankAccount(c.getBankAccount())
                        .usagePurpose(c.getUsagePurpose())
                        .requestNote(c.getRequestNote())
                        .privacyAgreed(c.getPrivacyAgreed())
                        .build())
                .orElse(null);
    }

    @Override
    public List<ContractDraftResult> getMyContracts(Long userId) {
        return contractRepositoryPort.findAllByUserId(userId).stream()
                .map(c -> ContractDraftResult.builder()
                        .contractId(c.getContractId())
                        .spaceId(c.getSpaceId())
                        .status(c.getStatus())
                        .desiredStartDate(c.getDesiredStartDate())
                        .desiredDurationMonths(c.getDesiredDurationMonths())
                        .address(c.getAddress())
                        .bankAccount(c.getBankAccount())
                        .usagePurpose(c.getUsagePurpose())
                        .requestNote(c.getRequestNote())
                        .privacyAgreed(c.getPrivacyAgreed())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ContractResult saveDraft(Long userId, ContractApplyCommand command) {
        Contract contract = contractRepositoryPort.findByUserIdAndSpaceId(userId, command.getSpaceId())
                .filter(c -> c.getStatus() == ContractStatus.DRAFT)
                .orElse(null);

        if (contract == null) {
            contract = createContractFromCommand(userId, command, ContractStatus.DRAFT);
        } else {
            contract.applyDraft(
                    command.getDesiredStartDate(),
                    command.getDesiredDurationMonths(),
                    command.getAddress(),
                    command.getBankAccount(),
                    command.getUsagePurpose(),
                    command.getRequestNote(),
                    command.getPrivacyAgreed()
            );
        }

        Contract saved = contractRepositoryPort.save(contract);
        return ContractResult.success(saved.getContractId(), "임시 저장이 완료되었습니다.");
    }

    @Override
    public ContractResult submitContract(Long userId, ContractApplyCommand command) {
        Contract contract = contractRepositoryPort.findByUserIdAndSpaceId(userId, command.getSpaceId())
                .filter(c -> c.getStatus() == ContractStatus.DRAFT)
                .orElse(null);

        if (contract == null) {
            contract = createContractFromCommand(userId, command, ContractStatus.PENDING);
        } else {
            contract.applyDraft(
                    command.getDesiredStartDate(),
                    command.getDesiredDurationMonths(),
                    command.getAddress(),
                    command.getBankAccount(),
                    command.getUsagePurpose(),
                    command.getRequestNote(),
                    command.getPrivacyAgreed()
            );
            contract.updateStatus(ContractStatus.PENDING);
        }

        Contract saved = contractRepositoryPort.save(contract);
        return ContractResult.success(saved.getContractId(), "계약 신청이 완료되었습니다.");
    }

    private Contract createContractFromCommand(Long userId, ContractApplyCommand command, ContractStatus status) {
        return Contract.builder()
                .userId(userId)
                .spaceId(command.getSpaceId())
                .origin(ContractOrigin.USER_INITIATED)
                .status(status)
                .address(command.getAddress())
                .bankAccount(command.getBankAccount())
                .desiredStartDate(command.getDesiredStartDate())
                .desiredDurationMonths(command.getDesiredDurationMonths())
                .usagePurpose(command.getUsagePurpose())
                .requestNote(command.getRequestNote())
                .privacyAgreed(command.getPrivacyAgreed())
                .build();
    }
}

