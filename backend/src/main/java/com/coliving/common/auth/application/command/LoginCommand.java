package com.coliving.common.auth.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginCommand {
    private final String loginId;
    private final String password;
}
