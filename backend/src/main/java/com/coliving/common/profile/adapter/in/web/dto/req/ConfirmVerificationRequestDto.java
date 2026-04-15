package com.coliving.common.profile.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AccessLevel;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ConfirmVerificationRequestDto {
    @NotBlank
    private String contact;
    
    @NotBlank
    private String code;
    
    @NotBlank
    private String type; // PHONE 또는 EMAIL
}
