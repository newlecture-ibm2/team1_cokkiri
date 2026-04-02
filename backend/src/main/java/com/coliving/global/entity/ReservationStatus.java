package com.coliving.global.entity;

/**
 * 예약 상태 Enum
 * - reservation 테이블의 status 컬럼에 매핑된다.
 * - EnumType.STRING 으로 저장되므로, 값 이름이 곧 DB 저장 값이다.
 */
public enum ReservationStatus {

    /** 예약 대기 (입주자가 예약 신청 직후 기본 상태) */
    PENDING,

    /** 예약 승인 (관리자가 승인 처리) */
    APPROVED,

    /** 예약 취소 (입주자 또는 관리자가 취소) */
    CANCELLED,

    /** 이용 완료 (예약 시간 종료 후 완료 처리) */
    COMPLETED
}
