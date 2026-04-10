package com.coliving.admin.payment.application.service;

import com.coliving.admin.payment.application.command.ApprovePaymentCommand;
import com.coliving.admin.payment.application.port.in.ApprovePaymentUseCase;
import com.coliving.admin.payment.application.port.in.ViewPaymentListUseCase;
import com.coliving.admin.payment.application.port.out.PaymentRepositoryPort;
import com.coliving.admin.payment.model.Payment;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPaymentService implements ApprovePaymentUseCase, ViewPaymentListUseCase {

    private final PaymentRepositoryPort paymentRepositoryPort;
    private final CreateNotificationUseCase createNotificationUseCase;

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

        Payment saved = paymentRepositoryPort.save(payment);

        // 결제 승인 알림을 해당 사용자에게 발송
        try {
            createNotificationUseCase.create(CreateNotificationCommand.builder()
                    .userId(saved.getUserId())
                    .type(NotificationType.PAYMENT_SUCCESS)
                    .title("결제가 승인되었습니다")
                    .message(String.format("%s 납부가 관리자에 의해 승인 처리되었습니다. (%s원)",
                            saved.getType(), saved.getAmount().toPlainString()))
                    .referenceType(ReferenceType.PAYMENT)
                    .referenceId(saved.getPaymentId())
                    .build());
        } catch (Exception e) {
            log.error("결제 승인 알림 발송 실패 paymentId={}, userId={}: {}",
                    saved.getPaymentId(), saved.getUserId(), e.getMessage());
        }

        return saved;
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

