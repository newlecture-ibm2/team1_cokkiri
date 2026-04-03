package com.coliving.admin.payment.model;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * 결제 상태
 */
public enum PaymentStatus {
    UNPAID,     // 미납
    PENDING,    // 결제 진행 중
    PAID;       // 완납

    @JsonCreator
    public static PaymentStatus from(String value) {
        for (PaymentStatus status : PaymentStatus.values()) {
            if (status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        return null;
    }
}
