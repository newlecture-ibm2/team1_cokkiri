package com.coliving.user.contract.application.result;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractResult {
    private final Long contractId;
    private final String message;

    public static ContractResult success(Long contractId, String message) {
        return ContractResult.builder()
                .contractId(contractId)
                .message(message)
                .build();
    }
}
