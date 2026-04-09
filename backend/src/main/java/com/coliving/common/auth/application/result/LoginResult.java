package com.coliving.common.auth.application.result;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResult {
    private final String accessToken;
    private final String refreshToken;
    
    // User info for the frontend UI
    private final Long userId;
    private final String loginId;
    private final String name;
    private final String role;
}
