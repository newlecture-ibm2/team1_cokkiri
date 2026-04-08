package com.coliving.resident.payment.application.port.in;

import com.coliving.admin.payment.model.Payment;
import java.util.List;

public interface ViewMyPaymentUseCase {
    List<Payment> getMyPayments(Long userId);
}
