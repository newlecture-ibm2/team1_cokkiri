package com.coliving.admin.payment.adapter.in.web;

import com.coliving.admin.payment.adapter.in.web.dto.req.ApprovePaymentRequestDto;
import com.coliving.admin.payment.adapter.in.web.dto.res.PaymentListResponseDto;
import com.coliving.admin.payment.adapter.in.web.dto.res.PaymentResponseDto;
import com.coliving.admin.payment.application.command.ApprovePaymentCommand;
import com.coliving.admin.payment.application.port.in.ApprovePaymentUseCase;
import com.coliving.admin.payment.application.port.in.ViewPaymentListUseCase;
import com.coliving.admin.payment.model.Payment;
import com.coliving.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final ApprovePaymentUseCase approvePaymentUseCase;
    private final ViewPaymentListUseCase viewPaymentListUseCase;

    @GetMapping
    public ApiResponse<PaymentListResponseDto> getAllPayments() {
        List<Payment> payments = viewPaymentListUseCase.getAllPayments();
        List<PaymentResponseDto> responseDtos = payments.stream()
                .map(PaymentResponseDto::from)
                .collect(Collectors.toList());
        return ApiResponse.ok(PaymentListResponseDto.from(responseDtos));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<PaymentResponseDto> approvePayment(
            @PathVariable("id") Long paymentId,
            @Valid @RequestBody ApprovePaymentRequestDto requestDto) {
        
        ApprovePaymentCommand command = ApprovePaymentCommand.builder()
                .paymentId(paymentId)
                .paymentMethod(requestDto.getPaymentMethod())
                .paidDate(requestDto.getPaidDate())
                .build();
        
        Payment approvedPayment = approvePaymentUseCase.approvePayment(command);
        return ApiResponse.ok(PaymentResponseDto.from(approvedPayment), "결제가 완료되었습니다.");
    }
}
