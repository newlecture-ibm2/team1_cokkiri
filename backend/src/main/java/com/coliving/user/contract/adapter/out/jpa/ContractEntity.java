package com.coliving.user.contract.adapter.out.jpa;

import com.coliving.admin.payment.adapter.out.jpa.PaymentEntity;
import com.coliving.global.entity.BaseEntity;
import com.coliving.user.contract.model.ContractLanguage;
import com.coliving.user.contract.model.ContractOrigin;
import com.coliving.user.contract.model.ContractStatus;
import com.coliving.user.contract.model.ContractStatusConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CONTRACT 테이블 매핑 JPA Entity
 * - Soft Delete 적용 (DELETE → UPDATE deleted_at)
 * - 조회 시 deleted_at IS NULL 자동 필터링
 */
@Entity
@Table(name = "contract")
@SQLDelete(sql = "UPDATE contract SET deleted_at = CURRENT_TIMESTAMP WHERE contract_id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ContractEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "space_id", nullable = false)
    private Long spaceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "origin", nullable = false, length = 20)
    private ContractOrigin origin;

    @Convert(converter = ContractStatusConverter.class)
    @Column(name = "status", nullable = false, length = 15)
    private ContractStatus status;

    @Builder.Default
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentEntity> payments = new ArrayList<>();

    // ── 신청 정보 (유저 신청 시) ──

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "bank_account", length = 100)
    private String bankAccount;

    @Column(name = "desired_start_date")
    private LocalDate desiredStartDate;

    @Column(name = "desired_duration_months")
    private Integer desiredDurationMonths;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_language", length = 5)
    private ContractLanguage contractLanguage;

    @Column(name = "privacy_agreed")
    private Boolean privacyAgreed;

    @Column(name = "usage_purpose", length = 200)
    private String usagePurpose;

    @Column(name = "request_note", columnDefinition = "TEXT")
    private String requestNote;

    // ── 최종 계약 정보 ──

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "monthly_rent", precision = 15, scale = 0)
    private BigDecimal monthlyRent;

    @Column(name = "deposit", precision = 15, scale = 0)
    private BigDecimal deposit;

    @Column(name = "special_terms", columnDefinition = "TEXT")
    private String specialTerms;

    // ── 승인/거절 ──

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "rejected_reason", columnDefinition = "TEXT")
    private String rejectedReason;

    @Column(name = "contracted_at")
    private OffsetDateTime contractedAt;

    // ── 상태 변경 메서드 ──

    public void applyDraft(LocalDate desiredStartDate, Integer desiredDurationMonths, 
                           String usagePurpose, String requestNote, Boolean privacyAgreed) {
        this.desiredStartDate = desiredStartDate;
        this.desiredDurationMonths = desiredDurationMonths;
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

    public void activate() {
        this.status = ContractStatus.ACTIVE;
    }

    public void terminate() {
        this.status = ContractStatus.TERMINATED;
    }

    public void expire() {
        this.status = ContractStatus.EXPIRED;
    }

    public void cancel() {
        this.status = ContractStatus.CANCELLED;
    }

    // ── 연관관계 편의 메서드 ──
    public void addPayment(PaymentEntity payment) {
        this.payments.add(payment);
        payment.assignContract(this);
    }
}
