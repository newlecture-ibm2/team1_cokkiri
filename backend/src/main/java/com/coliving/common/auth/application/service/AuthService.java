package com.coliving.common.auth.application.service;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.application.command.RegisterCommand;
import com.coliving.common.auth.application.port.in.RegisterUseCase;
import com.coliving.common.auth.application.port.out.AuthRepositoryPort;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService implements RegisterUseCase {

    private final AuthRepositoryPort authRepositoryPort;
    private final PasswordEncoder passwordEncoder;

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
}
