package com.coliving.admin.user.adapter.in.web.dto.req;

import com.coliving.common.auth.model.UserRole;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateAdminUserRoleRequestDto {
    private UserRole role;
}
