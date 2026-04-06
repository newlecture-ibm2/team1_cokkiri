package com.coliving.admin.user.adapter.in.web.dto.res;

import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class AdminUserResponseDto {
    private Long id;
    private String loginId;
    private String name;
    private String phone;
    private String email;
    private UserRole role;
    private UserStatus status;
    private OffsetDateTime createdAt;
}
