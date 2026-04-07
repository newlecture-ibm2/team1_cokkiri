package com.coliving.admin.contract.application.service;

import com.coliving.admin.contract.application.command.AdminApproveContractCommand;
import com.coliving.admin.contract.application.command.AdminRejectContractCommand;
import com.coliving.admin.contract.application.port.in.AdminContractUseCase;
import com.coliving.admin.contract.application.port.out.AdminContractRepositoryPort;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.admin.contract.application.result.AdminContractResult;
import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.model.ContractStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminContractService implements AdminContractUseCase {

    private final AdminContractRepositoryPort repositoryPort;
    private final NotificationRepositoryPort notificationRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<AdminContractListResult> viewPendingContracts() {
        return repositoryPort.findPendingContracts();
    }

    @Override
    public AdminContractResult approveContract(Long adminId, AdminApproveContractCommand command) {
        ContractEntity contract = repositoryPort.findById(command.getContractId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // PENDING 상태인 경우에만 승인 가능
        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        contract.approve(
                adminId,
                command.getStartDate(),
                command.getEndDate(),
                command.getMonthlyRent(),
                command.getDeposit(),
                command.getSpecialTerms()
        );

        repositoryPort.save(contract);

        // 알림 생성: 계약 승인
        notificationRepositoryPort.create(
                contract.getUserId(),
                NotificationType.CONTRACT_APPROVED,
                "입주 신청이 승인되었습니다.",
                String.format("[%s] 호실의 입주 신청이 승인되었습니다. 최종 조건을 확인하고 계약을 체결해 주세요.", contract.getSpaceId()),
                ReferenceType.CONTRACT,
                contract.getContractId()
        );

        return AdminContractResult.builder()
                .contractId(contract.getContractId())
                .message("계약이 승인되었습니다.")
                .status(contract.getStatus().name())
                .build();
    }

    @Override
    public AdminContractResult rejectContract(Long adminId, AdminRejectContractCommand command) {
        ContractEntity contract = repositoryPort.findById(command.getContractId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        contract.reject(adminId, command.getRejectedReason());

        repositoryPort.save(contract);

        // 알림 생성: 계약 반려
        notificationRepositoryPort.create(
                contract.getUserId(),
                NotificationType.CONTRACT_REJECTED,
                "입주 신청이 반려되었습니다.",
                String.format("반려 사유: %s", command.getRejectedReason()),
                ReferenceType.CONTRACT,
                contract.getContractId()
        );

        return AdminContractResult.builder()
                .contractId(contract.getContractId())
                .message("계약이 반려되었습니다.")
                .status(contract.getStatus().name())
                .build();
    }
}
