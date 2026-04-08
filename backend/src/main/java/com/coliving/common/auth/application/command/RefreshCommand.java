package com.coliving.common.auth.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefreshCommand {
    private final String refreshToken;
}
