package com.coliving.common.auth.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshRequestDto {
    @NotBlank(message = "Refresh Token은 필수입니다.")
    private String refreshToken;
}
