package com.coliving.admin.reservation.application.port.in;

import com.coliving.admin.reservation.adapter.in.web.dto.res.AdminReservationResponseDto;
import com.coliving.reservation.model.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 관리자 예약 조회 UseCase
 *
 * #82: GET /admin/reservations — 전체 예약 목록 조회 (상태 필터 + 페이지네이션)
 * 03-backend-architecture §1-3: admin/{feature}/application/port/in/
 */
public interface AdminReservationQueryUseCase {

    /**
     * 전체 예약 목록 조회
     *
     * @param status   필터: PENDING / APPROVED / CANCELLED / COMPLETED (null이면 전체)
     * @param pageable 페이지네이션
     * @return 페이지 응답
     */
    Page<AdminReservationResponseDto> getAllReservations(ReservationStatus status, Pageable pageable);
}
