package com.coliving.reservation.application.service;

import com.coliving.reservation.adapter.in.web.dto.AdminReservationResponse;
import com.coliving.reservation.adapter.in.web.dto.UserReservationResponse;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.application.port.in.ReservationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 예약 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationQueryService implements ReservationQueryUseCase {

    private final ReservationJpaRepository reservationRepository;

    @Override
    public List<UserReservationResponse> getUserReservations(Long userId) {
        List<ReservationEntity> reservations = reservationRepository
                .findByUser_UserIdOrderByReservationDateDescStartTimeDesc(userId);

        return reservations.stream()
                .map(UserReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdminReservationResponse> getAllReservations() {
        List<ReservationEntity> reservations = reservationRepository
                .findAllByOrderByReservationDateDescStartTimeDesc();
        
        return reservations.stream()
                .map(AdminReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
