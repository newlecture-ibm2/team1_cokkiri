package com.coliving.admin.payment.application.port.in;

import com.coliving.admin.payment.model.Payment;
import java.util.List;

public interface ViewPaymentListUseCase {
    List<Payment> getAllPayments();
    List<Payment> getPaymentsByUserId(Long userId);
}
