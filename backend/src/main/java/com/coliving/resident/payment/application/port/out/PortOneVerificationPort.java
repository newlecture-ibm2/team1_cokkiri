package com.coliving.resident.payment.application.port.out;

import java.math.BigDecimal;

public interface PortOneVerificationPort {
    BigDecimal getPaidAmount(String portonePaymentId);
}
