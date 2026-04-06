package com.coliving.reservation.application.service;

import com.coliving.reservation.adapter.in.web.dto.AdminReservationResponse;
import com.coliving.reservation.adapter.in.web.dto.res.UserReservationResponseDto;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.application.port.in.ReservationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 예약 조회(Query) 서비스
 *
 * #81 예약 조회 및 취소 롤백
 *
 * - getUserReservations: 입주자 본인 예약 목록 (UserReservationResponseDto)
 * - getAllReservations: 관리자 전체 예약 목록 — TODO (#82): admin 모듈로 분리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationQueryService implements ReservationQueryUseCase {

    private final ReservationJpaRepository reservationRepository;

    /**
     * 입주자 본인 예약 목록 조회 (GET /api/reservations/my)
     *
     * userId 기준으로 모든 예약을 최신순(날짜↓, 시작시간↓)으로 조회한다.
     * CANCELLED 포함 전체 이력을 반환한다.
     */
    @Override
    public List<UserReservationResponseDto> getUserReservations(Long userId) {
        List<ReservationEntity> reservations = reservationRepository
                .findByUser_UserIdOrderByReservationDateDescStartTimeDesc(userId);

        return reservations.stream()
                .map(UserReservationResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 관리자 전체 예약 목록 조회
     * TODO (#82): AdminReservationResponseDto 로 전환 및 admin 모듈로 분리 예정
     */
    @Override
    public List<AdminReservationResponse> getAllReservations() {
        List<ReservationEntity> reservations = reservationRepository
                .findAllByOrderByReservationDateDescStartTimeDesc();

        return reservations.stream()
                .map(AdminReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
