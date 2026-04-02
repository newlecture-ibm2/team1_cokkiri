package com.coliving.admin.payment.model;

/**
 * 결제 상태
 */
public enum PaymentStatus {
    UNPAID,     // 미납
    PENDING,    // 결제 진행 중
    PAID        // 완납
}
