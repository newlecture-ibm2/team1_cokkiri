package com.coliving.admin.user.application.port.out;

import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserRepositoryPort {
    Page<AdminUserResult> findUsers(UserRole role, String status, String name, String loginId, Pageable pageable);
    AdminUserResult findUserById(Long id);
    void deactivateUser(Long id);
    void changeUserRole(Long id, UserRole role);
    void updateUser(Long id, String name, String phone, String email);
}
