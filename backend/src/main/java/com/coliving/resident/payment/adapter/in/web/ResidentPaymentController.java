package com.coliving.resident.payment.adapter.in.web;

import com.coliving.admin.payment.adapter.in.web.dto.res.PaymentListResponseDto;
import com.coliving.admin.payment.adapter.in.web.dto.res.PaymentResponseDto;
import com.coliving.admin.payment.model.Payment;
import com.coliving.global.dto.ApiResponse;
import com.coliving.resident.payment.application.port.in.ViewMyPaymentUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class ResidentPaymentController {

    private final ViewMyPaymentUseCase viewMyPaymentUseCase;

    @GetMapping("/my")
    public ApiResponse<PaymentListResponseDto> getMyPayments() {
        // TODO: Replace with proper security user context after Security/Auth implementation is finalized
        // For now, attempting to get userId from Authentication (this assumes userId is stored in principal name or CustomUserDetails)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(auth.getName()); // Placeholder: auth.getName() is usually the loginId, but logic can vary.
        
        List<Payment> payments = viewMyPaymentUseCase.getMyPayments(userId);
        List<PaymentResponseDto> responseDtos = payments.stream()
                .map(PaymentResponseDto::from)
                .collect(Collectors.toList());
        return ApiResponse.ok(PaymentListResponseDto.from(responseDtos));
    }
}
