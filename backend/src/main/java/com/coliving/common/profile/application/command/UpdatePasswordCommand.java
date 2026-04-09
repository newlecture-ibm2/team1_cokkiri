package com.coliving.common.profile.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdatePasswordCommand {
    private String currentPassword;
    private String newPassword;
    private String newPasswordConfirm;
}
