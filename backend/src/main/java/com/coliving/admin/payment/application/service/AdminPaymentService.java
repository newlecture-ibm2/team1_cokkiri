package com.coliving.admin.payment.application.service;

import com.coliving.admin.payment.application.command.ApprovePaymentCommand;
import com.coliving.admin.payment.application.port.in.ApprovePaymentUseCase;
import com.coliving.admin.payment.application.port.in.ViewPaymentListUseCase;
import com.coliving.admin.payment.application.port.out.PaymentRepositoryPort;
import com.coliving.admin.payment.model.Payment;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPaymentService implements ApprovePaymentUseCase, ViewPaymentListUseCase {

    private final PaymentRepositoryPort paymentRepositoryPort;

    @Override
    @Transactional
    public Payment approvePayment(ApprovePaymentCommand command) {
        Payment payment = paymentRepositoryPort.findById(command.getPaymentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentMethod(command.getPaymentMethod());
        payment.setPaidDate(command.getPaidDate());

        return paymentRepositoryPort.save(payment);
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepositoryPort.findAll();
    }

    @Override
    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepositoryPort.findByUserId(userId);
    }
}
