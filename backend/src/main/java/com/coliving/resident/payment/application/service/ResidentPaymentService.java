package com.coliving.resident.payment.application.service;

import com.coliving.admin.payment.application.port.out.PaymentRepositoryPort;
import com.coliving.admin.payment.model.Payment;
import com.coliving.admin.payment.model.PaymentMethod;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.resident.payment.application.port.in.ConfirmPaymentUseCase;
import com.coliving.resident.payment.application.port.in.ViewMyPaymentUseCase;
import com.coliving.resident.payment.application.port.out.PortOneVerificationPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResidentPaymentService implements ViewMyPaymentUseCase, ConfirmPaymentUseCase {

    private final PaymentRepositoryPort paymentRepositoryPort;
    private final PortOneVerificationPort portOneVerificationPort;
    private final CreateNotificationUseCase createNotificationUseCase;

    @Override
    public List<Payment> getMyPayments(Long userId) {
        return paymentRepositoryPort.findByUserId(userId);
    }

    @Override
    @Transactional
    public Payment confirmPayment(String portonePaymentId, Long ourPaymentId, Long userId) {
        log.info("[ResidentPaymentService] Confirming payment for user: {}, Payment ID: {}, PortOne ID: {}", 
                userId, ourPaymentId, portonePaymentId);

        // 1. Fetch Payment from DB
        Payment payment = paymentRepositoryPort.findById(ourPaymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        // 2. Cross-check ownership
        if (!payment.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        
        // 3. Check already PAID
        if (payment.getStatus() == PaymentStatus.PAID) {
            return payment;
        }

        // 4. Verify amount from PortOne
        BigDecimal actualPaidAmount = portOneVerificationPort.getPaidAmount(portonePaymentId);
        
        if (actualPaidAmount.compareTo(payment.getAmount()) != 0) {
            log.error("[ResidentPaymentService] Payment Verification Failed! Expected: {}, Actually Paid: {}", 
                    payment.getAmount(), actualPaidAmount);
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        // 5. Update Status to PAID
        payment.markAsPaid(PaymentMethod.CARD); 
        Payment savedPayment = paymentRepositoryPort.save(payment);

        // 6. Notify Resident
        try {
            CreateNotificationCommand notificationCommand = CreateNotificationCommand.builder()
                    .userId(userId)
                    .type(NotificationType.PAYMENT_SUCCESS)
                    .title("결제가 완료되었습니다.")
                    .message(String.format("%s 납부가 정상 처리되었습니다. (%s원)", 
                            payment.getType(), payment.getAmount().toPlainString()))
                    .referenceType(ReferenceType.PAYMENT)
                    .referenceId(payment.getPaymentId())
                    .build();
            createNotificationUseCase.create(notificationCommand);
        } catch (Exception e) {
            log.error("[ResidentPaymentService] Failed to send notification: {}", e.getMessage());
        }

        return savedPayment;
    }
}
