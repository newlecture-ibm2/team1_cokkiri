package com.coliving.resident.payment.application.port.in;

import com.coliving.admin.payment.model.Payment;

public interface ConfirmPaymentUseCase {
    Payment confirmPayment(String portonePaymentId, Long ourPaymentId, Long userId);
}
