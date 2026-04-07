package com.coliving.admin.reservation.application.port.in;

/**
 * 관리자 예약 상태 변경 UseCase
 *
 * #82: POST /admin/reservations/{id}/approve — 예약 승인
 *      POST /admin/reservations/{id}/cancel  — 예약 취소
 * 03-backend-architecture §1-3: admin/{feature}/application/port/in/
 */
public interface AdminReservationCommandUseCase {

    /**
     * 예약 승인 (PENDING → APPROVED)
     *
     * @param adminId       승인 처리한 관리자 ID
     * @param reservationId 대상 예약 ID
     */
    void approveReservation(Long adminId, Long reservationId);

    /**
     * 예약 취소 (PENDING | APPROVED → CANCELLED)
     *
     * @param adminId       취소 처리한 관리자 ID
     * @param reservationId 대상 예약 ID
     */
    void cancelReservation(Long adminId, Long reservationId);
}
