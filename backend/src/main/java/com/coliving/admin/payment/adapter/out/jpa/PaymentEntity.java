package com.coliving.admin.payment.adapter.out.jpa;

import com.coliving.admin.payment.model.PaymentMethod;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.admin.payment.model.PaymentType;
import com.coliving.global.entity.BaseEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * PAYMENT 테이블 매핑 JPA Entity
 * - Soft Delete 적용
 * - contract_id 또는 reservation_id 중 하나는 반드시 존재 (DB CHECK 제약)
 */
@Entity
@Table(name = "payments")
@SQLDelete(sql = "UPDATE payments SET deleted_at = CURRENT_TIMESTAMP WHERE payment_id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private ContractEntity contract;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 15)
    private PaymentType type;

    @Column(name = "amount", nullable = false, precision = 15, scale = 0)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "billing_date", nullable = false)
    private LocalDate billingDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    // ── Builder ──

    @Builder
    public PaymentEntity(ContractEntity contract, Long reservationId, Long userId,
            PaymentType type, BigDecimal amount, PaymentStatus status,
            PaymentMethod paymentMethod, LocalDate billingDate, LocalDate paidDate) {
        this.contract = contract;
        this.reservationId = reservationId;
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.billingDate = billingDate;
        this.paidDate = paidDate;
    }

    // ── 상태 변경 메서드 ──

    /**
     * 결제 처리 (UNPAID → PAID)
     */
    public void markPaid(PaymentMethod paymentMethod, LocalDate paidDate) {
        this.status = PaymentStatus.PAID;
        this.paymentMethod = paymentMethod;
        this.paidDate = paidDate;
    }

    /**
     * 결제 진행 중으로 변경 (UNPAID → PENDING)
     */
    public void markPending() {
        this.status = PaymentStatus.PENDING;
    }

    public void assignContract(ContractEntity contract) {
        this.contract = contract;
    }
}
