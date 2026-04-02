package com.coliving.user.contract.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Contract 도메인 모델 (순수 Java 객체)
 * JPA Entity와 분리된 비즈니스 로직 담당 객체
 */
public class Contract {

    private Long contractId;
    private Long userId;
    private Long spaceId;
    private ContractOrigin origin;
    private ContractStatus status;

    // 신청 정보
    private String address;
    private String bankAccount;
    private LocalDate desiredStartDate;
    private Integer desiredDurationMonths;
    private ContractLanguage contractLanguage;
    private Boolean privacyAgreed;
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
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;

    // ── 생성자 ──

    public Contract() {
    }

    // ── Getter / Setter ──

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getSpaceId() { return spaceId; }
    public void setSpaceId(Long spaceId) { this.spaceId = spaceId; }

    public ContractOrigin getOrigin() { return origin; }
    public void setOrigin(ContractOrigin origin) { this.origin = origin; }

    public ContractStatus getStatus() { return status; }
    public void setStatus(ContractStatus status) { this.status = status; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBankAccount() { return bankAccount; }
    public void setBankAccount(String bankAccount) { this.bankAccount = bankAccount; }

    public LocalDate getDesiredStartDate() { return desiredStartDate; }
    public void setDesiredStartDate(LocalDate desiredStartDate) { this.desiredStartDate = desiredStartDate; }

    public Integer getDesiredDurationMonths() { return desiredDurationMonths; }
    public void setDesiredDurationMonths(Integer desiredDurationMonths) { this.desiredDurationMonths = desiredDurationMonths; }

    public ContractLanguage getContractLanguage() { return contractLanguage; }
    public void setContractLanguage(ContractLanguage contractLanguage) { this.contractLanguage = contractLanguage; }

    public Boolean getPrivacyAgreed() { return privacyAgreed; }
    public void setPrivacyAgreed(Boolean privacyAgreed) { this.privacyAgreed = privacyAgreed; }

    public String getRequestNote() { return requestNote; }
    public void setRequestNote(String requestNote) { this.requestNote = requestNote; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getMonthlyRent() { return monthlyRent; }
    public void setMonthlyRent(BigDecimal monthlyRent) { this.monthlyRent = monthlyRent; }

    public BigDecimal getDeposit() { return deposit; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }

    public String getSpecialTerms() { return specialTerms; }
    public void setSpecialTerms(String specialTerms) { this.specialTerms = specialTerms; }

    public Long getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }

    public String getRejectedReason() { return rejectedReason; }
    public void setRejectedReason(String rejectedReason) { this.rejectedReason = rejectedReason; }

    public OffsetDateTime getContractedAt() { return contractedAt; }
    public void setContractedAt(OffsetDateTime contractedAt) { this.contractedAt = contractedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public OffsetDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }
}
