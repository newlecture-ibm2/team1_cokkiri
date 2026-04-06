package com.coliving.reservation.application.port.in;

import com.coliving.reservation.adapter.in.web.dto.AdminReservationResponse;
import com.coliving.reservation.adapter.in.web.dto.res.UserReservationResponseDto;

import java.util.List;

/**
 * 예약 조회 유스케이스 (Inbound Port)
 *
 * #81: 입주자 예약 조회 및 취소
 * - getUserReservations: UserReservationResponseDto (res/ 폴더, Dto 접미사)
 * - getAllReservations: AdminReservationResponse (#82에서 분리 예정)
 */
public interface ReservationQueryUseCase {

    /**
     * 특정 사용자의 전체 예약 목록을 조회한다 (최신순).
     *
     * @param userId 사용자 ID
     * @return 예약 응답 목록 (UserReservationResponseDto)
     */
    List<UserReservationResponseDto> getUserReservations(Long userId);

    /**
     * 관리자가 전체 예약 목록을 조회한다 (최신순).
     * TODO (#82): AdminReservationResponseDto 로 전환 및 admin 모듈로 분리
     *
     * @return 예약 응답 목록
     */
    List<AdminReservationResponse> getAllReservations();
}
