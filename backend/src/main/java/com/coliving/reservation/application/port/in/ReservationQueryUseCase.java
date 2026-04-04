package com.coliving.reservation.application.port.in;

import com.coliving.reservation.adapter.in.web.dto.AdminReservationResponse;
import com.coliving.reservation.adapter.in.web.dto.UserReservationResponse;

import java.util.List;

/**
 * 예약 조회 유스케이스 (Inbound Port)
 */
public interface ReservationQueryUseCase {

    /**
     * 특정 사용자의 전체 예약 목록을 조회한다 (최신순).
     *
     * @param userId 사용자 ID
     * @return 예약 응답 목록
     */
    List<UserReservationResponse> getUserReservations(Long userId);

    /**
     * 관리자가 전체 예약 목록을 조회한다 (최신순).
     *
     * @return 예약 응답 목록
     */
    List<AdminReservationResponse> getAllReservations();
}
