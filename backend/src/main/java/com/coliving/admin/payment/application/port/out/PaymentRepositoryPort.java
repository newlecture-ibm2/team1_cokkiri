package com.coliving.admin.payment.application.port.out;

import com.coliving.admin.payment.model.Payment;
import java.util.List;
import java.util.Optional;

public interface PaymentRepositoryPort {
    Payment save(Payment payment);
    Optional<Payment> findById(Long paymentId);
    List<Payment> findAll();
    List<Payment> findByUserId(Long userId);
    boolean existsByContractAndMonth(Long contractId, com.coliving.admin.payment.model.PaymentType type, int year, int month);
}
