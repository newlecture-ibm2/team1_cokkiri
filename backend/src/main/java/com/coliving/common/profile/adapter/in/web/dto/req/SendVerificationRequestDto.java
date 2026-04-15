package com.coliving.common.profile.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AccessLevel;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SendVerificationRequestDto {
    @NotBlank
    private String contact; // 휴대폰 번호 또는 이메일
    
    @NotBlank
    private String type; // PHONE 또는 EMAIL
}
