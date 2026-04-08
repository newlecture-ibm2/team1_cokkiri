package com.coliving.admin.payment.adapter.in.web.dto.req;

import com.coliving.admin.payment.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ApprovePaymentRequestDto {
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    
    @NotNull(message = "Paid date is required")
    private LocalDate paidDate;
}
