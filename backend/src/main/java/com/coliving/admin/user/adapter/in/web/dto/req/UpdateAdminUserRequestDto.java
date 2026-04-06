package com.coliving.admin.user.adapter.in.web.dto.req;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateAdminUserRequestDto {
    private String name;
    private String phone;
    private String email;
}
