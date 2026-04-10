package com.coliving.admin.contract.application.service;

import com.coliving.admin.contract.application.command.AdminApproveContractCommand;
import com.coliving.admin.contract.application.command.AdminCreateContractCommand;
import com.coliving.admin.contract.application.command.AdminRejectContractCommand;
import com.coliving.admin.contract.application.command.AdminUpdateContractCommand;
import com.coliving.admin.contract.application.port.in.AdminContractUseCase;
import com.coliving.admin.contract.application.port.out.AdminContractRepositoryPort;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.admin.contract.application.result.AdminContractResult;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractOrigin;
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
    private final SpaceJpaRepository spaceJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final ContractJpaRepository contractJpaRepository;

    // ── ADM-CTR-05: PENDING 신청 목록 조회 ──

    @Override
    @Transactional(readOnly = true)
    public List<AdminContractListResult> viewPendingContracts() {
        return repositoryPort.findPendingContracts();
    }

    // ── ADM-CTR-01: 전체 계약 목록 조회 ──

    @Override
    @Transactional(readOnly = true)
    public List<AdminContractListResult> viewAllContracts(ContractStatus status) {
        return repositoryPort.findAllContracts(status);
    }

    // ── ADM-CTR-02: 관리자 직접 계약 등록 (ACTIVE 직행) ──

    @Override
    public AdminContractResult createContract(Long adminId, AdminCreateContractCommand command) {
        // 사용자 존재 확인
        UserEntity user = userJpaRepository.findById(command.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        // 공간 존재 및 AVAILABLE 확인
        SpaceEntity space = spaceJpaRepository.findById(command.getSpaceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));
        if (space.getStatus() != SpaceStatus.AVAILABLE) {
            throw new BusinessException(ErrorCode.SPACE_NOT_AVAILABLE);
        }

        // 활성 계약 존재 확인
        if (contractJpaRepository.existsBySpaceIdAndStatus(command.getSpaceId(), ContractStatus.ACTIVE)) {
            throw new BusinessException(ErrorCode.ACTIVE_CONTRACT_EXISTS);
        }

        // 계약 생성 (ADMIN_INITIATED → ACTIVE 직행, 신청 단계 생략)
        ContractEntity contract = ContractEntity.builder()
                .userId(command.getUserId())
                .spaceId(command.getSpaceId())
                .origin(ContractOrigin.ADMIN_INITIATED)
                .status(ContractStatus.ACTIVE)
                .startDate(command.getStartDate())
                .endDate(command.getEndDate())
                .monthlyRent(command.getMonthlyRent())
                .deposit(command.getDeposit())
                .approvedBy(adminId)
                .build();

        repositoryPort.save(contract);

        // 공간 사용 중으로 변경
        space.changeStatus(SpaceStatus.OCCUPIED);
        spaceJpaRepository.save(space);

        // 유저 역할 RESIDENT로 승격
        user.changeRole(UserRole.RESIDENT);
        userJpaRepository.save(user);

        // 알림 생성
        notificationRepositoryPort.create(
                user.getUserId(),
                NotificationType.CONTRACT_APPROVED,
                "관리자에 의해 계약이 등록되었습니다.",
                String.format("[%s] 호실의 계약이 등록되었습니다. 입주자로 전환됩니다.", space.getName()),
                ReferenceType.CONTRACT,
                contract.getContractId()
        );

        return AdminContractResult.builder()
                .contractId(contract.getContractId())
                .message("계약이 직접 등록되었습니다.")
                .status(contract.getStatus().name())
                .build();
    }

    // ── ADM-CTR-03: 계약 수정 ──

    @Override
    public AdminContractResult updateContract(Long adminId, AdminUpdateContractCommand command) {
        ContractEntity contract = repositoryPort.findById(command.getContractId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // TERMINATED 상태는 수정불가
        if (contract.getStatus() == ContractStatus.TERMINATED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        contract.updateContractInfo(
                command.getStartDate(),
                command.getEndDate(),
                command.getMonthlyRent(),
                command.getDeposit(),
                command.getSpecialTerms()
        );

        repositoryPort.save(contract);

        return AdminContractResult.builder()
                .contractId(contract.getContractId())
                .message("계약 정보가 수정되었습니다.")
                .status(contract.getStatus().name())
                .build();
    }

    // ── ADM-CTR-04: 계약 만료 ──

    @Override
    public AdminContractResult expireContract(Long adminId, Long contractId) {
        ContractEntity contract = repositoryPort.findById(contractId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        contract.expire();
        repositoryPort.save(contract);

        // 공간 AVAILABLE 복원
        SpaceEntity space = spaceJpaRepository.findById(contract.getSpaceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));
        space.changeStatus(SpaceStatus.AVAILABLE);
        spaceJpaRepository.save(space);

        // 다른 ACTIVE 계약 없으면 role → USER 복원
        demoteUserIfNoActiveContract(contract.getUserId());

        // 알림 생성
        notificationRepositoryPort.create(
                contract.getUserId(),
                NotificationType.CONTRACT_EXPIRED,
                "계약이 만료되었습니다.",
                "계약이 만료 처리되었습니다. 새로운 계약이 필요하시면 방 둘러보기를 이용해 주세요.",
                ReferenceType.CONTRACT,
                contract.getContractId()
        );

        return AdminContractResult.builder()
                .contractId(contract.getContractId())
                .message("계약이 만료 처리되었습니다.")
                .status(contract.getStatus().name())
                .build();
    }

    // ── ADM-CTR-04: 계약 해지 ──

    @Override
    public AdminContractResult terminateContract(Long adminId, Long contractId) {
        ContractEntity contract = repositoryPort.findById(contractId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        contract.terminate();
        repositoryPort.save(contract);

        // 공간 AVAILABLE 복원
        SpaceEntity space = spaceJpaRepository.findById(contract.getSpaceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));
        space.changeStatus(SpaceStatus.AVAILABLE);
        spaceJpaRepository.save(space);

        // 다른 ACTIVE 계약 없으면 role → USER 복원
        demoteUserIfNoActiveContract(contract.getUserId());

        // 알림 생성
        notificationRepositoryPort.create(
                contract.getUserId(),
                NotificationType.CONTRACT_EXPIRED,
                "계약이 해지되었습니다.",
                "관리자에 의해 계약이 해지 처리되었습니다.",
                ReferenceType.CONTRACT,
                contract.getContractId()
        );

        return AdminContractResult.builder()
                .contractId(contract.getContractId())
                .message("계약이 해지 처리되었습니다.")
                .status(contract.getStatus().name())
                .build();
    }

    // ── ADM-CTR-05: 신청 승인 ──

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

    // ── ADM-CTR-05: 신청 반려 ──

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

    // ── 헬퍼: 유저의 다른 ACTIVE 계약이 없으면 USER로 복원 ──

    private void demoteUserIfNoActiveContract(Long userId) {
        List<ContractEntity> activeContracts = contractJpaRepository.findByUserIdAndStatus(userId, ContractStatus.ACTIVE);
        if (activeContracts.isEmpty()) {
            UserEntity user = userJpaRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
            if (user.getRole() == UserRole.RESIDENT) {
                user.changeRole(UserRole.USER);
                userJpaRepository.save(user);
            }
        }
    }
}
