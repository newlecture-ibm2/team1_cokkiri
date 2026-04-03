package com.coliving.reservation.application.port.in;

import com.coliving.reservation.adapter.in.web.dto.ReservationCreateRequest;

/**
 * 예약 생성 유스케이스 (Inbound Port)
 */
public interface ReservationCommandUseCase {
    
    /**
     * 시설 예약을 신청한다.
     * 
     * @param userId 요청한 사용자 ID
     * @param request 예약 요청 정보
     * @return 생성된 예약 ID
     */
    /**
     * 시설 예약을 신청한다.
     * 
     * @param userId 요청한 사용자 ID
     * @param request 예약 요청 정보
     * @return 생성된 예약 ID
     */
    Long reserveFacility(Long userId, ReservationCreateRequest request);

    /**
     * 예약을 취소한다.
     *
     * @param userId 요청한 사용자 ID
     * @param reservationId 취소할 예약 ID
     */
    void cancelReservation(Long userId, Long reservationId);
}
