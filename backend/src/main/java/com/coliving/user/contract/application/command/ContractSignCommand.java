package com.coliving.user.contract.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractSignCommand {
    private final Long contractId;
    private final Boolean termsAgreed;
    private final Boolean privacyPolicyAgreed;
    private final String signatureData;
}
