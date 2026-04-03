package com.coliving.user.contract.application.command;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
public class ContractApplyCommand {
    private final Long spaceId;
    private final LocalDate desiredStartDate;
    private final Integer desiredDurationMonths;
    private final String usagePurpose;
    private final Boolean privacyAgreed;
    private final String requestNote;
}
