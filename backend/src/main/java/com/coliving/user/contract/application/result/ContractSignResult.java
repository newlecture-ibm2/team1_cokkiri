package com.coliving.user.contract.application.result;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractSignResult {
    private final Long contractId;
    private final Long spaceId;
    private final String status;
    private final String role;
    private final String accessToken;
    private final String refreshToken;
    private final String message;
}
