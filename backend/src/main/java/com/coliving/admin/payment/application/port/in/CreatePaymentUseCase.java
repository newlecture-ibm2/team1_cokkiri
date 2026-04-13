package com.coliving.admin.payment.application.port.in;

import com.coliving.admin.payment.model.Payment;
import com.coliving.admin.payment.application.command.CreatePaymentCommand;

public interface CreatePaymentUseCase {
    Payment createPayment(CreatePaymentCommand command);
}
