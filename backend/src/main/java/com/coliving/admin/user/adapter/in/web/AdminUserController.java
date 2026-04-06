package com.coliving.admin.user.adapter.in.web;

import com.coliving.admin.user.application.port.in.AdminUserUseCase;
import com.coliving.admin.user.application.command.UpdateAdminUserCommand;
import com.coliving.admin.user.adapter.in.web.dto.req.UpdateAdminUserRequestDto;
import com.coliving.admin.user.adapter.in.web.dto.req.UpdateAdminUserRoleRequestDto;
import com.coliving.admin.user.adapter.in.web.dto.res.AdminUserResponseDto;
import com.coliving.common.auth.model.UserRole;
import com.coliving.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserUseCase adminUserUseCase;

    @GetMapping
    public ApiResponse<Page<AdminUserResponseDto>> getUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String loginId,
            Pageable pageable) {
        return ApiResponse.ok(adminUserUseCase.findUsers(role, status, name, loginId, pageable).map(result -> 
                AdminUserResponseDto.builder()
                        .id(result.getId())
                        .loginId(result.getLoginId())
                        .name(result.getName())
                        .phone(result.getPhone())
                        .email(result.getEmail())
                        .role(result.getRole())
                        .status(result.getStatus())
                        .createdAt(result.getCreatedAt())
                        .build()
        ));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminUserResponseDto> getUserById(@PathVariable Long id) {
        var result = adminUserUseCase.findUserById(id);
        return ApiResponse.ok(AdminUserResponseDto.builder()
                .id(result.getId())
                .loginId(result.getLoginId())
                .name(result.getName())
                .phone(result.getPhone())
                .email(result.getEmail())
                .role(result.getRole())
                .status(result.getStatus())
                .createdAt(result.getCreatedAt())
                .build());
    }

    @PatchMapping("/{id}/deactivate")
    public ApiResponse<Void> deactivateUser(@PathVariable Long id) {
        adminUserUseCase.deactivateUser(id);
        return ApiResponse.ok(null, "User has been deactivated successfully.");
    }

    @PatchMapping("/{id}/role")
    public ApiResponse<Void> changeUserRole(@PathVariable Long id, @RequestBody UpdateAdminUserRoleRequestDto req) {
        adminUserUseCase.changeUserRole(id, req.getRole());
        return ApiResponse.ok(null, "User role has been updated successfully.");
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateUser(@PathVariable Long id, @RequestBody UpdateAdminUserRequestDto req) {
        adminUserUseCase.updateUser(UpdateAdminUserCommand.builder()
                .id(id)
                .name(req.getName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .build());
        return ApiResponse.ok(null, "User information has been updated successfully.");
    }
}
