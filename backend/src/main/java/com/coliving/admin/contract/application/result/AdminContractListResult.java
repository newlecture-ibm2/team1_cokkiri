package com.coliving.admin.contract.application.result;

import com.coliving.user.contract.model.ContractStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
public class AdminContractListResult {
    private Long contractId;
    private Long userId;
    private String userName; 
    private Long spaceId;
    private String spaceName; 
    private ContractStatus status;
    private LocalDate desiredStartDate;
    private Integer desiredDurationMonths;
    private String address;
    private String bankAccount;
    private String usagePurpose;
    private String requestNote;
    private OffsetDateTime createdAt;
}
