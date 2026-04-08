package com.coliving.common.auth.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponseDto {
    private final String accessToken;
    private final String refreshToken;
    private final User user;

    @Getter
    @Builder
    public static class User {
        private final Long userId;
        private final String loginId;
        private final String name;
        private final String role;
    }
}
