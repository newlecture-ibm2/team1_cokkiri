package com.coliving.common.auth.application.service;

import com.coliving.common.auth.adapter.out.jpa.RefreshTokenEntity;
import com.coliving.common.auth.adapter.out.jpa.TokenBlacklistEntity;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.application.command.LoginCommand;
import com.coliving.common.auth.application.command.RefreshCommand;
import com.coliving.common.auth.application.command.RegisterCommand;
import com.coliving.common.auth.application.port.in.LoginUseCase;
import com.coliving.common.auth.application.port.in.LogoutUseCase;
import com.coliving.common.auth.application.port.in.RefreshUseCase;
import com.coliving.common.auth.application.port.in.RegisterUseCase;
import com.coliving.common.auth.application.port.out.AuthRepositoryPort;
import com.coliving.common.auth.application.result.LoginResult;
import com.coliving.common.auth.application.result.RefreshResult;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.security.JwtTokenProvider;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService implements RegisterUseCase, LoginUseCase, RefreshUseCase, LogoutUseCase {

    private final AuthRepositoryPort authRepositoryPort;
    private final ContractJpaRepository contractJpaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public void register(RegisterCommand command) {
        if (!command.getPassword().equals(command.getPasswordConfirm())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "비밀번호가 일치하지 않습니다.");
        }

        if (authRepositoryPort.existsByLoginId(command.getLoginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        /* 이메일 중복 체크가 필요한 경우 여기에 추가 */
        
        String encodedPassword = passwordEncoder.encode(command.getPassword());
        
        UserEntity newUser = UserEntity.builder()
                .loginId(command.getLoginId())
                .passwordHash(encodedPassword)
                .name(command.getName())
                .birthDate(command.getBirthDate())
                .gender(command.getGender())
                .nationality(command.getNationality())
                .phone(command.getPhone())
                .email(command.getEmail())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
                
        authRepositoryPort.save(newUser);
    }

    @Override
    @Transactional
    public LoginResult login(LoginCommand command) {
        UserEntity user = authRepositoryPort.findByLoginId(command.getLoginId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        
        if (!passwordEncoder.matches(command.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new BusinessException(ErrorCode.ACCOUNT_DEACTIVATED, "정지된 계정입니다.");
        }

        Long contractId = null;
        Long spaceId = null;

        if (user.getRole() == UserRole.RESIDENT) {
            List<ContractEntity> contracts = contractJpaRepository.findByUserIdAndStatus(user.getUserId(), ContractStatus.ACTIVE);
            if (!contracts.isEmpty()) {
                ContractEntity activeContract = contracts.get(0);
                contractId = activeContract.getContractId();
                if (activeContract.getSpaceId() != null) {
                    spaceId = activeContract.getSpaceId();
                }
            } else {
                user.changeRole(UserRole.USER); // Degrading role since active contract doesn't exist
                authRepositoryPort.save(user);
            }
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getUserId(), user.getRole().name(), contractId, spaceId);
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUserId());

        // Revoke active refresh tokens
        authRepositoryPort.revokeAllRefreshTokensByUserId(user.getUserId());
        
        // Save new refresh token
        OffsetDateTime expiresAt = OffsetDateTime.now().plus(jwtTokenProvider.getRefreshExpiration(), ChronoUnit.MILLIS);
        RefreshTokenEntity refreshTokenEntity = RefreshTokenEntity.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(expiresAt)
                .isRevoked(false)
                .build();
        authRepositoryPort.saveRefreshToken(refreshTokenEntity);

        return LoginResult.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getUserId())
                .loginId(user.getLoginId())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public RefreshResult refresh(RefreshCommand command) {
        String refreshToken = command.getRefreshToken();
        
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED, "리프레시 토큰이 만료되었습니다.");
        }

        RefreshTokenEntity refreshTokenEntity = authRepositoryPort.findRefreshToken(refreshToken)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS, "유효하지 않은 리프레시 토큰입니다."));

        if (refreshTokenEntity.getIsRevoked() || refreshTokenEntity.isExpired()) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED, "만료되거나 폐기된 토큰입니다.");
        }

        UserEntity user = refreshTokenEntity.getUser();
        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new BusinessException(ErrorCode.ACCOUNT_DEACTIVATED);
        }

        Long contractId = null;
        Long spaceId = null;

        if (user.getRole() == UserRole.RESIDENT) {
            List<ContractEntity> contracts = contractJpaRepository.findByUserIdAndStatus(user.getUserId(), ContractStatus.ACTIVE);
            if (!contracts.isEmpty()) {
                ContractEntity activeContract = contracts.get(0);
                contractId = activeContract.getContractId();
                if (activeContract.getSpaceId() != null) {
                    spaceId = activeContract.getSpaceId();
                }
            } else {
                user.changeRole(UserRole.USER); // Degrading role since active contract doesn't exist
                authRepositoryPort.save(user);
            }
        }

        String newAccessToken = jwtTokenProvider.createAccessToken(user.getUserId(), user.getRole().name(), contractId, spaceId);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getUserId());

        // Revoke the old refresh token
        refreshTokenEntity.revoke();
        authRepositoryPort.saveRefreshToken(refreshTokenEntity);

        // Save new refresh token
        OffsetDateTime expiresAt = OffsetDateTime.now().plus(jwtTokenProvider.getRefreshExpiration(), ChronoUnit.MILLIS);
        RefreshTokenEntity newRefreshTokenEntity = RefreshTokenEntity.builder()
                .user(user)
                .token(newRefreshToken)
                .expiresAt(expiresAt)
                .isRevoked(false)
                .build();
        authRepositoryPort.saveRefreshToken(newRefreshTokenEntity);

        return RefreshResult.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    @Transactional
    public void logout(String accessToken) {
        if (!jwtTokenProvider.validateToken(accessToken)) {
            return; // 이미 만료되거나 유효하지 않으면 굳이 처리 필요 없음
        }

        String jti = jwtTokenProvider.getJti(accessToken);
        if (jti != null && !authRepositoryPort.isTokenBlacklisted(jti)) {
            Date expiration = jwtTokenProvider.getExpiration(accessToken);
            OffsetDateTime expiresAt = OffsetDateTime.ofInstant(expiration.toInstant(), ZoneId.systemDefault());

            TokenBlacklistEntity blacklistEntity = TokenBlacklistEntity.builder()
                    .tokenJti(jti)
                    .expiresAt(expiresAt)
                    .reason("LOGOUT")
                    .build();
            
            authRepositoryPort.saveTokenBlacklist(blacklistEntity);
        }

        Long userId = jwtTokenProvider.getUserId(accessToken);
        authRepositoryPort.revokeAllRefreshTokensByUserId(userId);
    }
}
