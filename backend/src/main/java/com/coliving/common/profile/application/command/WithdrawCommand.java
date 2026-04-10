package com.coliving.common.profile.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WithdrawCommand {
    private final String password;
}
