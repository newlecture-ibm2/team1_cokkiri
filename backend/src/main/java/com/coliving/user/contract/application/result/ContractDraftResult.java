package com.coliving.user.contract.application.result;

import com.coliving.user.contract.model.ContractStatus;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
public class ContractDraftResult {
    private final Long contractId;
    private final Long spaceId;
    private final ContractStatus status;
    private final LocalDate desiredStartDate;
    private final Integer desiredDurationMonths;
    private final String address;
    private final String bankAccount;
    private final String usagePurpose;
    private final String requestNote;
    private final Boolean privacyAgreed;
}
