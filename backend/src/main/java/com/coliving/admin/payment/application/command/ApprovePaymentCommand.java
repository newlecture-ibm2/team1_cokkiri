package com.coliving.admin.payment.application.command;

import com.coliving.admin.payment.model.PaymentMethod;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ApprovePaymentCommand {
    private Long paymentId;
    private PaymentMethod paymentMethod;
    private LocalDate paidDate;
}
