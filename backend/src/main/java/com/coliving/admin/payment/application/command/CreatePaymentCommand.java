package com.coliving.admin.payment.application.command;

import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.admin.payment.model.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class CreatePaymentCommand {
    private Long contractId;
    private Long reservationId;
    private Long userId;
    private PaymentType type;
    private BigDecimal amount;
    private PaymentStatus status;
    private LocalDate billingDate;
}
