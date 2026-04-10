package com.coliving.admin.payment.adapter.in.web.dto.res;

import com.coliving.admin.payment.model.Payment;
import com.coliving.admin.payment.model.PaymentMethod;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.admin.payment.model.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
public class PaymentResponseDto {
    private Long paymentId;
    private Long contractId;
    private Long reservationId;
    private Long userId;
    private String userName;
    private String loginId;
    private PaymentType type;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private LocalDate billingDate;
    private LocalDate paidDate;
    private OffsetDateTime createdAt;

    public static PaymentResponseDto from(Payment payment) {
        return PaymentResponseDto.builder()
                .paymentId(payment.getPaymentId())
                .contractId(payment.getContractId())
                .reservationId(payment.getReservationId())
                .userId(payment.getUserId())
                .userName(payment.getUserName())
                .loginId(payment.getLoginId())
                .type(payment.getType())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .billingDate(payment.getBillingDate())
                .paidDate(payment.getPaidDate())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
