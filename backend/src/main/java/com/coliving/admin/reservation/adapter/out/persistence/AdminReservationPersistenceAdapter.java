package com.coliving.admin.reservation.adapter.out.persistence;

import com.coliving.admin.reservation.application.port.out.AdminReservationRepositoryPort;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.model.ReservationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 관리자 예약 Repository 포트 구현체
 *
 * 03-backend-architecture §1-3: admin/{feature}/adapter/out/persistence/
 * 04-domain-collaboration §1: 타 도메인 JpaRepository 조회 전용 사용 허용
 *   → ReservationJpaRepository 직접 사용 (도메인 협업 규칙 준수)
 */
@Component
@RequiredArgsConstructor
public class AdminReservationPersistenceAdapter implements AdminReservationRepositoryPort {

    private final ReservationJpaRepository reservationJpaRepository;

    @Override
    public Page<ReservationEntity> findAll(ReservationStatus status, Pageable pageable) {
        return reservationJpaRepository.findAllByStatusFilter(status, pageable);
    }

    @Override
    public Optional<ReservationEntity> findById(Long reservationId) {
        return reservationJpaRepository.findById(reservationId);
    }

    @Override
    public ReservationEntity save(ReservationEntity entity) {
        // 03-backend-architecture §5: 소프트 삭제 및 상태 변경 후 save() 명시 호출
        return reservationJpaRepository.save(entity);
    }
}
