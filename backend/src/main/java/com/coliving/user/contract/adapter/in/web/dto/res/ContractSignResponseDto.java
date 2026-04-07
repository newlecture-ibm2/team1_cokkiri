package com.coliving.user.contract.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractSignResponseDto {
    private Long contractId;
    private String status;
    private String role;
    private String accessToken;
    private String refreshToken;
    private String message;
}
