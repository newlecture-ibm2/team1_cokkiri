package com.coliving.common.auth.application.port.out;

import com.coliving.common.auth.adapter.out.jpa.RefreshTokenEntity;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import java.util.Optional;

public interface AuthRepositoryPort {
    boolean existsByLoginId(String loginId);
    boolean existsByEmail(String email);
    Optional<UserEntity> findByLoginId(String loginId);
    void save(UserEntity userEntity);
    
    void saveRefreshToken(RefreshTokenEntity refreshTokenEntity);
    void revokeAllRefreshTokensByUserId(Long userId);
}
