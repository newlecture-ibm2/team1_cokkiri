package com.coliving.user.contract.application.result;

import com.coliving.user.contract.model.ContractStatus;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
public class ContractDraftResult {
    private final Long contractId;
    private final Long spaceId;
    private final String spaceName;
    private final ContractStatus status;
    private final LocalDate desiredStartDate;
    private final Integer desiredDurationMonths;
    private final String address;
    private final String bankAccount;
    private final String usagePurpose;
    private final String requestNote;
    private final Boolean privacyAgreed;
    private final String rejectedReason;
    private final Integer monthlyRent;
    private final Integer deposit;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final OffsetDateTime createdAt;
}
