package com.coliving.admin.user.application.port.out;

import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

public interface AdminUserRepositoryPort {
    Page<AdminUserResult> findUsers(UserRole role, String status, String name, String loginId, Pageable pageable);

    /** ACTIVE 상태이면서 역할이 {@code roles} 중 하나인 회원 (알림 대량 발송 등) */
    List<AdminUserResult> findActiveUsersWithRoles(Set<UserRole> roles);
    AdminUserResult findUserById(Long id);
    void deactivateUser(Long id);
    void changeUserRole(Long id, UserRole role);
    void updateUser(Long id, String name, String phone, String email);
}
