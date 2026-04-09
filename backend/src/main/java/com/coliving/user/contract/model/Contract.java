package com.coliving.user.contract.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
@AllArgsConstructor
public class Contract {
    private final Long contractId;
    private final Long version;
    private final Long userId;
    private final Long spaceId;
    private final ContractOrigin origin;
    private ContractStatus status;

    // 신청 정보
    private String address;
    private String bankAccount;
    private LocalDate desiredStartDate;
    private Integer desiredDurationMonths;
    private ContractLanguage contractLanguage;
    private Boolean privacyAgreed;
    private String usagePurpose;
    private String requestNote;

    // 최종 계약 정보
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyRent;
    private BigDecimal deposit;
    private String specialTerms;

    // 승인/거절
    private Long approvedBy;
    private String rejectedReason;
    private OffsetDateTime contractedAt;

    // 감사 필드
    private OffsetDateTime createdAt;

    public void applyDraft(LocalDate desiredStartDate, Integer desiredDurationMonths,
            String address, String bankAccount,
            String usagePurpose, String requestNote, Boolean privacyAgreed) {
        this.desiredStartDate = desiredStartDate;
        this.desiredDurationMonths = desiredDurationMonths;
        this.address = address;
        this.bankAccount = bankAccount;
        this.usagePurpose = usagePurpose;
        this.requestNote = requestNote;
        this.privacyAgreed = privacyAgreed;
    }

    public void updateStatus(ContractStatus status) {
        this.status = status;
    }

    public void approve(Long approvedBy, LocalDate startDate, LocalDate endDate,
            BigDecimal monthlyRent, BigDecimal deposit, String specialTerms) {
        this.status = ContractStatus.APPROVED;
        this.approvedBy = approvedBy;
        this.startDate = startDate;
        this.endDate = endDate;
        this.monthlyRent = monthlyRent;
        this.deposit = deposit;
        this.specialTerms = specialTerms;
        this.contractedAt = OffsetDateTime.now();
    }

    public void reject(Long approvedBy, String rejectedReason) {
        this.status = ContractStatus.REJECTED;
        this.approvedBy = approvedBy;
        this.rejectedReason = rejectedReason;
    }

    public void sign(String signatureData) {
        this.status = ContractStatus.ACTIVE;
        this.contractedAt = OffsetDateTime.now();
        // 실제 서명 데이터는 history나 별도 테이블에 저장될 수 있으나 
        // 현재는 status 변경 및 체결 시점 기록을 핵심 행위로 간주함
    }
}
