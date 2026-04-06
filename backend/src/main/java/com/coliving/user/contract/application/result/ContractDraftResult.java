package com.coliving.user.contract.application.result;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
public class ContractDraftResult {
    private final Long contractId;
    private final LocalDate desiredStartDate;
    private final Integer desiredDurationMonths;
    private final String address;
    private final String bankAccount;
    private final String usagePurpose;
    private final String requestNote;
    private final Boolean privacyAgreed;
}
