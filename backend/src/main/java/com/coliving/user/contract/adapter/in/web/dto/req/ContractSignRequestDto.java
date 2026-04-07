package com.coliving.user.contract.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractSignRequestDto {

    @NotNull(message = "이용약관 동의는 필수입니다.")
    private Boolean termsAgreed;

    @NotNull(message = "개인정보 처리방침 동의는 필수입니다.")
    private Boolean privacyPolicyAgreed;

    @NotBlank(message = "전자서명 데이터는 필수입니다.")
    private String signatureData;
}
