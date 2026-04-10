package com.coliving.user.contract.application.service;

import com.coliving.admin.space.application.port.out.AdminSpaceRepositoryPort;
import com.coliving.admin.space.model.AdminSpace;
import com.coliving.admin.user.application.port.out.AdminUserRepositoryPort;
import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.security.JwtTokenProvider;
import com.coliving.user.contract.application.command.ContractApplyCommand;
import com.coliving.user.contract.application.command.ContractSignCommand;
import com.coliving.user.contract.application.port.in.ContractUseCase;
import com.coliving.user.contract.application.port.out.ContractRepositoryPort;
import com.coliving.user.contract.application.result.ContractDraftResult;
import com.coliving.user.contract.application.result.ContractResult;
import com.coliving.user.contract.application.result.ContractSignResult;
import com.coliving.user.contract.model.Contract;
import com.coliving.user.contract.model.ContractOrigin;
import com.coliving.user.contract.model.ContractStatus;
import com.coliving.admin.space.model.SpaceStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ContractService implements ContractUseCase {

    private final ContractRepositoryPort contractRepositoryPort;
    private final AdminUserRepositoryPort adminUserRepositoryPort;
    private final AdminSpaceRepositoryPort adminSpaceRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;
    private final NotificationRepositoryPort notificationRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public ContractDraftResult getDraft(Long userId, Long spaceId) {
        return contractRepositoryPort.findDraftByUserIdAndSpaceId(userId, spaceId)
                .map(this::toDraftResult)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractDraftResult getContract(Long userId, Long contractId) {
        Contract contract = contractRepositoryPort.findById(contractId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (!contract.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return toDraftResult(contract);
    }

    private ContractDraftResult toDraftResult(Contract c) {
        return ContractDraftResult.builder()
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
                .rejectedReason(c.getRejectedReason())
                .createdAt(c.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractDraftResult> getMyContracts(Long userId) {
        return contractRepositoryPort.findAllByUserId(userId).stream()
                .map(this::toDraftResult)
                .collect(Collectors.toList());
    }

    @Override
    public ContractResult saveDraft(Long userId, ContractApplyCommand command) {
        Contract contract = null;

        // 1. Try to find by contractId first (explicit update)
        if (command.getContractId() != null) {
            contract = contractRepositoryPort.findById(command.getContractId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
            
            if (!contract.getUserId().equals(userId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }

        // 2. If not found, try to find current DRAFT for this space
        if (contract == null) {
            contract = contractRepositoryPort.findDraftByUserIdAndSpaceId(userId, command.getSpaceId())
                    .orElse(null);
        }

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
                    command.getPrivacyAgreed());
        }

        Contract saved = contractRepositoryPort.save(contract);
        return ContractResult.success(saved.getContractId(), "임시 저장이 완료되었습니다.");
    }

    @Override
    public ContractResult submitContract(Long userId, ContractApplyCommand command) {
        Contract contract = null;

        // 1. Try to find by contractId first
        if (command.getContractId() != null) {
            contract = contractRepositoryPort.findById(command.getContractId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

            if (!contract.getUserId().equals(userId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }

        // 2. If not found, try to find current DRAFT for this space
        if (contract == null) {
            contract = contractRepositoryPort.findDraftByUserIdAndSpaceId(userId, command.getSpaceId())
                    .orElse(null);
        }

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
                    command.getPrivacyAgreed());
            contract.updateStatus(ContractStatus.PENDING);
        }

        Contract saved = contractRepositoryPort.save(contract);

        // 관리자 전원에게 신규 입주 신청 알림
        notifyAllAdminsOfContractSubmission(saved);

        return ContractResult.success(saved.getContractId(), "계약 신청이 완료되었습니다.");
    }

    private void notifyAllAdminsOfContractSubmission(Contract contract) {
        try {
            Page<AdminUserResult> adminPage = adminUserRepositoryPort.findUsers(
                    UserRole.ADMIN, UserStatus.ACTIVE.name(), null, null, Pageable.unpaged());
            if (adminPage == null || adminPage.getContent() == null) {
                return;
            }
            for (AdminUserResult admin : adminPage.getContent()) {
                try {
                    notificationRepositoryPort.create(
                            admin.getId(),
                            NotificationType.CONTRACT_SUBMITTED,
                            "새로운 입주 신청이 접수되었습니다",
                            String.format("호실 ID [%d]에 대한 입주 신청이 접수되었습니다. 확인해 주세요.",
                                    contract.getSpaceId()),
                            ReferenceType.CONTRACT,
                            contract.getContractId());
                } catch (Exception e) {
                    log.warn("관리자 계약 신청 알림 실패 adminId={}: {}", admin.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("계약 신청 관리자 알림 팬아웃 실패 contractId={}: {}", contract.getContractId(), e.getMessage());
        }
    }

    @Override
    public ContractSignResult signContract(Long userId, ContractSignCommand command) {
        // 1. 계약 조회 + APPROVED 상태 검증
        Contract contract = contractRepositoryPort.findById(command.getContractId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (!contract.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (contract.getStatus() != ContractStatus.APPROVED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        // 2. 호실 상태 확인 (AdminSpaceRepositoryPort 사용)
        var space = adminSpaceRepositoryPort.findById(contract.getSpaceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 데모/테스트 편의: OCCUPIED여도 계약 체결 허용 (MAINTENANCE만 차단)
        if (space.getStatus() == SpaceStatus.MAINTENANCE) {
            throw new BusinessException(ErrorCode.SPACE_NOT_AVAILABLE);
        }

        // 3. 이미 활성 계약 보유 체크 (테스트/데모 편의를 위해 중복 계약 허용 - 실제 정책에 따라 조정 가능)
        /*
        boolean hasActive = contractRepositoryPort.findAllByUserId(userId).stream()
                .anyMatch(c -> c.getStatus() == ContractStatus.ACTIVE);
        if (hasActive) {
            throw new BusinessException(ErrorCode.ACTIVE_CONTRACT_EXISTS);
        }
        */

        // 4. 계약 체결 (전자서명 데이터 영구 보존)
        contract.sign(command.getSignatureData());
        contractRepositoryPort.save(contract);

        // 5. Space → OCCUPIED (AdminSpaceRepositoryPort 사용)
        space.changeStatus(SpaceStatus.OCCUPIED);
        adminSpaceRepositoryPort.save(space);

        // 6. User → RESIDENT (AdminUserRepositoryPort 사용)
        adminUserRepositoryPort.changeUserRole(userId, UserRole.RESIDENT);

        // 7. JWT 재발급 (RESIDENT + contract_id + space_id)
        String accessToken = jwtTokenProvider.createAccessToken(
                userId, UserRole.RESIDENT.name(), contract.getContractId(), contract.getSpaceId());
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        // 8. 알림 생성
        notificationRepositoryPort.create(
                userId,
                NotificationType.CONTRACT_ACTIVATED,
                "계약이 체결되었습니다.",
                "입주를 축하합니다! 호실 정보와 IoT 기기를 확인해 보세요.",
                ReferenceType.CONTRACT,
                contract.getContractId());

        return ContractSignResult.builder()
                .contractId(contract.getContractId())
                .spaceId(contract.getSpaceId())
                .status(ContractStatus.ACTIVE.name())
                .role(UserRole.RESIDENT.name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .message("계약이 성공적으로 체결되었습니다.")
                .build();
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
