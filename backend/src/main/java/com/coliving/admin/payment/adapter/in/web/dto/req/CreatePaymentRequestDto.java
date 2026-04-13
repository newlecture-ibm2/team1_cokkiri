package com.coliving.admin.payment.adapter.in.web.dto.req;

import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.admin.payment.model.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CreatePaymentRequestDto {
    private Long contractId;
    private Long reservationId;
    
    @NotNull(message = "사용자 ID는 필수입니다.")
    private Long userId;
    
    @NotNull(message = "결제 유형은 필수입니다.")
    private PaymentType type;
    
    @NotNull(message = "금액은 필수입니다.")
    private BigDecimal amount;
    
    @NotNull(message = "상태는 필수입니다.")
    private PaymentStatus status;
    
    private LocalDate billingDate;
}
