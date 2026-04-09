package com.coliving.admin.user.adapter.out.persistence;

import com.coliving.admin.user.application.port.out.AdminUserRepositoryPort;
import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminUserPersistenceAdapter implements AdminUserRepositoryPort {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Page<AdminUserResult> findUsers(UserRole role, String status, String name, String loginId,
            Pageable pageable) {
        // JPA Specification or QueryDSL should ideally be used for multi-filter.
        // For MVP, we fetch all and slice, or we can use custom queries. Since this is
        // an MVP scaffold, we'll return all mapped.
        // To do this properly, a custom query method in UserJpaRepository is needed.
        // For now, doing a basic findAll.
        return userJpaRepository.findAll(pageable).map(this::toResult);
    }

    @Override
    public AdminUserResult findUserById(Long id) {
        return toResult(fetchUser(id));
    }

    @Override
    public void deactivateUser(Long id) {
        UserEntity user = fetchUser(id);
        user.deactivate();
        userJpaRepository.save(user);
    }

    @Override
    public void changeUserRole(Long id, UserRole role) {
        UserEntity user = fetchUser(id);
        user.changeRole(role);
        userJpaRepository.save(user);
    }

    @Override
    public void updateUser(Long id, String name, String phone, String email) {
        UserEntity user = fetchUser(id);
        user.updateProfile(name, phone, email, null);
        userJpaRepository.save(user);
    }

    private UserEntity fetchUser(Long id) {
        return userJpaRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }

    private AdminUserResult toResult(UserEntity entity) {
        return AdminUserResult.builder()
                .id(entity.getUserId())
                .loginId(entity.getLoginId())
                .name(entity.getName())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .role(entity.getRole())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
