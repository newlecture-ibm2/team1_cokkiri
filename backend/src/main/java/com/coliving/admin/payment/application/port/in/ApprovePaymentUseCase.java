package com.coliving.admin.payment.application.port.in;

import com.coliving.admin.payment.application.command.ApprovePaymentCommand;
import com.coliving.admin.payment.model.Payment;

public interface ApprovePaymentUseCase {
    Payment approvePayment(ApprovePaymentCommand command);
}
