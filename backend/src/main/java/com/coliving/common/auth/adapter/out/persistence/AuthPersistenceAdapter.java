package com.coliving.common.auth.adapter.out.persistence;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.application.port.out.AuthRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthPersistenceAdapter implements AuthRepositoryPort {

    private final UserJpaRepository userJpaRepository;

    @Override
    public boolean existsByLoginId(String loginId) {
        return userJpaRepository.existsByLoginId(loginId);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userJpaRepository.existsByEmail(email);
    }

    @Override
    public void save(UserEntity userEntity) {
        userJpaRepository.save(userEntity);
    }
}
