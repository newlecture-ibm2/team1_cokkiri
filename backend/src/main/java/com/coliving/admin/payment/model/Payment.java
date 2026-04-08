package com.coliving.admin.payment.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Payment 도메인 모델 (순수 Java 객체)
 */
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    private Long paymentId;
    private Long contractId;
    private Long reservationId;
    private Long userId;
    private PaymentType type;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private LocalDate billingDate;
    private LocalDate paidDate;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;

    public void markAsPaid(PaymentMethod paymentMethod) {
        this.status = PaymentStatus.PAID;
        this.paymentMethod = paymentMethod;
        this.paidDate = LocalDate.now();
    }
}
