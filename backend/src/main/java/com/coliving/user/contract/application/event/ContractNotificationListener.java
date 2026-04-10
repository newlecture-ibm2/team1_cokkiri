package com.coliving.user.contract.application.event;

import com.coliving.admin.user.application.port.out.AdminUserRepositoryPort;
import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.admin.contract.application.event.ContractStatusChangedByAdminEvent;
import com.coliving.user.contract.model.Contract;
import com.coliving.user.contract.model.ContractStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContractNotificationListener {

    private final AdminUserRepositoryPort adminUserRepositoryPort;
    private final CreateNotificationUseCase createNotificationUseCase;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onContractSubmitted(ContractSubmittedEvent event) {
        Contract contract = event.getContract();
        log.info("Handling ContractSubmittedEvent for contract: {}", contract.getContractId());

        try {
            Page<AdminUserResult> adminPage = adminUserRepositoryPort.findUsers(
                    UserRole.ADMIN, UserStatus.ACTIVE.name(), null, null, Pageable.unpaged());
            
            if (adminPage == null || adminPage.getContent() == null) return;

            for (AdminUserResult admin : adminPage.getContent()) {
                try {
                    createNotificationUseCase.create(CreateNotificationCommand.builder()
                            .userId(admin.getId())
                            .type(NotificationType.CONTRACT_SUBMITTED)
                            .title("새로운 입주 신청이 접수되었습니다")
                            .message(String.format("호실 ID [%d]에 대한 입주 신청이 접수되었습니다.", contract.getSpaceId()))
                            .referenceType(ReferenceType.CONTRACT)
                            .referenceId(contract.getContractId())
                            .build());
                } catch (Exception e) {
                    log.warn("Failed to notify admin {} about contract {}: {}", admin.getId(), contract.getContractId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Fatal error during ContractSubmittedEvent fan-out: {}", e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onContractStatusChanged(ContractStatusChangedByAdminEvent event) {
        log.info("Handling ContractStatusChangedByAdminEvent for contract: {}, status: {}", 
                event.getContractId(), event.getNewStatus());

        NotificationType type = determineType(event.getNewStatus(), event.getMessage());
        String finalMessage = event.getRejectedReason() != null 
                ? String.format("%s (사유: %s)", event.getMessage(), event.getRejectedReason())
                : event.getMessage();

        try {
            createNotificationUseCase.create(CreateNotificationCommand.builder()
                    .userId(event.getUserId())
                    .type(type)
                    .title(event.getMessage())
                    .message(finalMessage)
                    .referenceType(ReferenceType.CONTRACT)
                    .referenceId(event.getContractId())
                    .build());
        } catch (Exception e) {
            log.error("Failed to notify user {} about contract status change {}: {}", 
                    event.getUserId(), event.getContractId(), e.getMessage());
        }
    }

    private NotificationType determineType(ContractStatus status, String message) {
        if (status == ContractStatus.APPROVED) return NotificationType.CONTRACT_APPROVED;
        if (status == ContractStatus.REJECTED) return NotificationType.CONTRACT_REJECTED;
        if (status == ContractStatus.ACTIVE) {
            if (message.contains("수정")) return NotificationType.CONTRACT_UPDATED;
            return NotificationType.CONTRACT_ACTIVATED;
        }
        return NotificationType.CONTRACT_EXPIRED;
    }
}
