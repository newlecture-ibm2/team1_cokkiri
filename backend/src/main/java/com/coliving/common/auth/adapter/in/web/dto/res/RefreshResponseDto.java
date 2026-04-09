package com.coliving.common.auth.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefreshResponseDto {
    private final String accessToken;
    private final String refreshToken;
}
