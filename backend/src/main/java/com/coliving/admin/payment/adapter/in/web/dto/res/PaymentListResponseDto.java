package com.coliving.admin.payment.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class PaymentListResponseDto {
    private List<PaymentResponseDto> payments;
    
    public static PaymentListResponseDto from(List<PaymentResponseDto> payments) {
        return PaymentListResponseDto.builder()
                .payments(payments)
                .build();
    }
}
