package com.coliving.admin.contract.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminRejectContractCommand {
    private Long contractId;
    private String rejectedReason;
}
