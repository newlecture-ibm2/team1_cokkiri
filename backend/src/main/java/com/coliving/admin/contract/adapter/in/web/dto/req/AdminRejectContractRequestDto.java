package com.coliving.admin.contract.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminRejectContractRequestDto {
    @NotBlank(message = "반려 사유는 필수입니다.")
    private String rejectedReason;
}
