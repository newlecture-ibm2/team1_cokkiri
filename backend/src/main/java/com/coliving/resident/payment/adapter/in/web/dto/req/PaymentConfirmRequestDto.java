package com.coliving.resident.payment.adapter.in.web.dto.req;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PaymentConfirmRequestDto {
    private String portonePaymentId;
    private Long ourPaymentId;
}
