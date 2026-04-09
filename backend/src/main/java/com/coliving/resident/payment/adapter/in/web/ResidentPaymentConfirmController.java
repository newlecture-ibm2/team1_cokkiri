package com.coliving.resident.payment.adapter.in.web;

import com.coliving.admin.payment.adapter.in.web.dto.res.PaymentResponseDto;
import com.coliving.admin.payment.model.Payment;
import com.coliving.global.dto.ApiResponse;
import com.coliving.resident.payment.adapter.in.web.dto.req.PaymentConfirmRequestDto;
import com.coliving.resident.payment.application.port.in.ConfirmPaymentUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class ResidentPaymentConfirmController {

    private final ConfirmPaymentUseCase confirmPaymentUseCase;

    @PostMapping("/confirm")
    public ApiResponse<PaymentResponseDto> confirmPayment(@RequestBody PaymentConfirmRequestDto requestDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(auth.getName());
        
        Payment confirmed = confirmPaymentUseCase.confirmPayment(
                requestDto.getPortonePaymentId(),
                requestDto.getOurPaymentId(),
                userId
        );
        
        return ApiResponse.ok(PaymentResponseDto.from(confirmed));
    }
}
