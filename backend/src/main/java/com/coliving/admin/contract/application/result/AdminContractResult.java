package com.coliving.admin.contract.application.result;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminContractResult {
    private Long contractId;
    private String message;
    private String status;
}
