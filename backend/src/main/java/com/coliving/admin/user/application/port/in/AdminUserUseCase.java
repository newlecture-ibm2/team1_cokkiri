package com.coliving.admin.user.application.port.in;

import com.coliving.admin.user.application.command.UpdateAdminUserCommand;
import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserUseCase {
    Page<AdminUserResult> findUsers(UserRole role, String status, String name, String loginId, Pageable pageable);
    AdminUserResult findUserById(Long id);
    void deactivateUser(Long id);
    void changeUserRole(Long id, UserRole role);
    void updateUser(UpdateAdminUserCommand command);
}
