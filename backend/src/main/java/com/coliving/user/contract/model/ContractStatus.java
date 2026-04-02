package com.coliving.user.contract.model;

/**
 * 계약 상태 (전체 라이프사이클)
 * DRAFT → PENDING → APPROVED → ACTIVE → EXPIRED/TERMINATED
 *                  → REJECTED
 *       → CANCELLED
 */
public enum ContractStatus {
    DRAFT,          // 임시저장
    PENDING,        // 심사 대기
    APPROVED,       // 승인 (계약 확정 전)
    REJECTED,       // 거절
    CANCELLED,      // 취소 (유저 자발)
    ACTIVE,         // 입주 중 (활성 계약)
    EXPIRED,        // 만료
    TERMINATED      // 해지
}
