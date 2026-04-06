package com.coliving.admin.user.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateAdminUserCommand {
    private Long id;
    private String name;
    private String phone;
    private String email;
}
