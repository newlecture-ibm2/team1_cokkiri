package com.coliving.admin.contract.application.result;

import com.coliving.user.contract.model.ContractOrigin;
import com.coliving.user.contract.model.ContractStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
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
    private ContractOrigin origin;

    // 신청 정보
    private LocalDate desiredStartDate;
    private Integer desiredDurationMonths;
    private String address;
    private String bankAccount;
    private String usagePurpose;
    private String requestNote;

    // 확정 계약 정보
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyRent;
    private BigDecimal deposit;
    private String specialTerms;

    private OffsetDateTime createdAt;
}
