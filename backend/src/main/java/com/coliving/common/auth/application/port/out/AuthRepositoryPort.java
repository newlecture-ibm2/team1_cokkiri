package com.coliving.common.auth.application.port.out;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;

public interface AuthRepositoryPort {
    boolean existsByLoginId(String loginId);
    boolean existsByEmail(String email);
    void save(UserEntity userEntity);
}
