package com.coliving.admin.reservation.application.port.out;

import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.model.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 관리자 예약 조회/변경 Repository 포트
 *
 * 03-backend-architecture §1-3: admin/{feature}/application/port/out/
 */
public interface AdminReservationRepositoryPort {

    /** 전체 예약 목록 (상태 필터 가능, 페이지네이션) */
    Page<ReservationEntity> findAll(ReservationStatus status, Pageable pageable);

    /** 예약 단건 조회 */
    Optional<ReservationEntity> findById(Long reservationId);

    /** 예약 저장 (상태 변경 후 명시적 save) */
    ReservationEntity save(ReservationEntity entity);
}
