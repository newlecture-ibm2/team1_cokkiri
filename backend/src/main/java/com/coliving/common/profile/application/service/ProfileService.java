package com.coliving.common.profile.application.service;

import com.coliving.common.profile.adapter.in.web.dto.res.ProfileResponseDto;
import com.coliving.common.profile.application.port.in.GetProfileUseCase;
import com.coliving.common.profile.application.port.out.ProfileRepositoryPort;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.coliving.common.profile.application.command.UpdatePasswordCommand;
import com.coliving.common.profile.application.command.WithdrawCommand;
import com.coliving.common.profile.application.port.in.UpdatePasswordUseCase;
import com.coliving.common.profile.application.port.in.WithdrawUseCase;
import com.coliving.admin.payment.adapter.out.jpa.PaymentJpaRepository;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService implements GetProfileUseCase, UpdatePasswordUseCase, WithdrawUseCase {

    private final ProfileRepositoryPort profileRepositoryPort;
    private final ContractJpaRepository contractJpaRepository;
    private final PaymentJpaRepository paymentJpaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponseDto getProfile(Long userId) {
        return profileRepositoryPort.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
    }

    @Override
    @Transactional
    public void updatePassword(Long userId, UpdatePasswordCommand command) {
        if (!command.getNewPassword().equals(command.getNewPasswordConfirm())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "새 비밀번호가 서로 일치하지 않습니다.");
        }

        String pattern = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}$";
        if (!command.getNewPassword().matches(pattern)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
        }

        String currentHash = profileRepositoryPort.getPasswordHash(userId);
        if (!passwordEncoder.matches(command.getCurrentPassword(), currentHash)) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        if (passwordEncoder.matches(command.getNewPassword(), currentHash)) {
            throw new BusinessException(ErrorCode.SAME_PASSWORD);
        }

        profileRepositoryPort.updatePassword(userId, passwordEncoder.encode(command.getNewPassword()));
    }

    @Override
    @Transactional
    public void withdraw(Long userId, WithdrawCommand command) {
        String currentHash = profileRepositoryPort.getPasswordHash(userId);
        if (!passwordEncoder.matches(command.getPassword(), currentHash)) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        if (!contractJpaRepository.findByUserIdAndStatus(userId, ContractStatus.ACTIVE).isEmpty()) {
            throw new BusinessException(ErrorCode.ACTIVE_CONTRACT_EXISTS, "활성 계약이 존재하여 탈퇴할 수 없습니다.");
        }

        if (!paymentJpaRepository.findByUserIdAndStatus(userId, PaymentStatus.UNPAID).isEmpty()) {
            throw new BusinessException(ErrorCode.UNPAID_PAYMENT_EXISTS, "미납된 결제가 존재하여 탈퇴할 수 없습니다.");
        }

        profileRepositoryPort.withdrawUser(userId);
    }
}
