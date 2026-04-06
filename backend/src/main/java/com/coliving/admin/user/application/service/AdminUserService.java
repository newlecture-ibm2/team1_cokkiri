package com.coliving.admin.user.application.service;

import com.coliving.admin.user.application.command.UpdateAdminUserCommand;
import com.coliving.admin.user.application.port.in.AdminUserUseCase;
import com.coliving.admin.user.application.port.out.AdminUserRepositoryPort;
import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.model.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService implements AdminUserUseCase {

    private final AdminUserRepositoryPort adminUserRepositoryPort;

    @Override
    public Page<AdminUserResult> findUsers(UserRole role, String status, String name, String loginId, Pageable pageable) {
        return adminUserRepositoryPort.findUsers(role, status, name, loginId, pageable);
    }

    @Override
    public AdminUserResult findUserById(Long id) {
        return adminUserRepositoryPort.findUserById(id);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        adminUserRepositoryPort.deactivateUser(id);
    }

    @Override
    @Transactional
    public void changeUserRole(Long id, UserRole role) {
        if (role != UserRole.USER && role != UserRole.ADMIN) {
            throw new IllegalArgumentException("Admins can only promote users to ADMIN or demote to USER directly. RESIDENT status is managed via Contracts.");
        }
        adminUserRepositoryPort.changeUserRole(id, role);
    }

    @Override
    @Transactional
    public void updateUser(UpdateAdminUserCommand command) {
        adminUserRepositoryPort.updateUser(command.getId(), command.getName(), command.getPhone(), command.getEmail());
    }
}
