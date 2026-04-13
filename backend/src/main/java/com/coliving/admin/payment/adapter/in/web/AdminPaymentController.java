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
    private final com.coliving.admin.payment.application.port.in.CreatePaymentUseCase createPaymentUseCase;

    @GetMapping
    public ApiResponse<PaymentListResponseDto> getAllPayments() {
        List<Payment> payments = viewPaymentListUseCase.getAllPayments();
        List<PaymentResponseDto> responseDtos = payments.stream()
                .map(PaymentResponseDto::from)
                .collect(Collectors.toList());
        return ApiResponse.ok(PaymentListResponseDto.from(responseDtos));
    }

    @PostMapping
    public ApiResponse<PaymentResponseDto> createPayment(@Valid @RequestBody com.coliving.admin.payment.adapter.in.web.dto.req.CreatePaymentRequestDto requestDto) {
        com.coliving.admin.payment.application.command.CreatePaymentCommand command = com.coliving.admin.payment.application.command.CreatePaymentCommand.builder()
                .contractId(requestDto.getContractId())
                .reservationId(requestDto.getReservationId())
                .userId(requestDto.getUserId())
                .type(requestDto.getType())
                .amount(requestDto.getAmount())
                .status(requestDto.getStatus())
                .billingDate(requestDto.getBillingDate())
                .build();

        Payment created = createPaymentUseCase.createPayment(command);
        return ApiResponse.ok(PaymentResponseDto.from(created), "결제 정보가 등록되었습니다.");
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
