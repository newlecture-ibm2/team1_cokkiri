package com.coliving.common.auth.adapter.out.persistence;

import com.coliving.common.auth.adapter.out.jpa.RefreshTokenEntity;
import com.coliving.common.auth.adapter.out.jpa.RefreshTokenJpaRepository;
import com.coliving.common.auth.adapter.out.jpa.TokenBlacklistEntity;
import com.coliving.common.auth.adapter.out.jpa.TokenBlacklistJpaRepository;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.application.port.out.AuthRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuthPersistenceAdapter implements AuthRepositoryPort {

    private final UserJpaRepository userJpaRepository;
    private final RefreshTokenJpaRepository refreshTokenJpaRepository;
    private final TokenBlacklistJpaRepository tokenBlacklistJpaRepository;

    @Override
    public boolean existsByLoginId(String loginId) {
        return userJpaRepository.existsByLoginId(loginId);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userJpaRepository.existsByEmail(email);
    }

    @Override
    public Optional<UserEntity> findByLoginId(String loginId) {
        return userJpaRepository.findByLoginId(loginId);
    }

    @Override
    public void save(UserEntity userEntity) {
        userJpaRepository.save(userEntity);
    }

    @Override
    public void saveRefreshToken(RefreshTokenEntity refreshTokenEntity) {
        refreshTokenJpaRepository.save(refreshTokenEntity);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void revokeAllRefreshTokensByUserId(Long userId) {
        refreshTokenJpaRepository.revokeAllByUserId(userId);
    }

    @SuppressWarnings("null")
    @Override
    public Optional<UserEntity> findById(Long userId) {
        return userJpaRepository.findById(userId);
    }

    @Override
    public Optional<RefreshTokenEntity> findRefreshToken(String token) {
        return refreshTokenJpaRepository.findByToken(token);
    }

    @SuppressWarnings("null")
    @Override
    public void saveTokenBlacklist(TokenBlacklistEntity tokenBlacklistEntity) {
        tokenBlacklistJpaRepository.save(tokenBlacklistEntity);
    }

    @Override
    public boolean isTokenBlacklisted(String jti) {
        return tokenBlacklistJpaRepository.existsByTokenJti(jti);
    }
}
