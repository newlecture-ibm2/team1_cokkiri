package com.coliving.admin.reservation.application.service;

import com.coliving.admin.reservation.adapter.in.web.dto.res.AdminReservationResponseDto;
import com.coliving.admin.reservation.application.port.in.AdminReservationCommandUseCase;
import com.coliving.admin.reservation.application.port.in.AdminReservationQueryUseCase;
import com.coliving.admin.reservation.application.port.out.AdminReservationRepositoryPort;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.model.ReservationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 예약 관리 서비스
 *
 * #82: GET /admin/reservations — 전체 예약 조회 (상태 필터 + 페이지네이션)
 * #82: POST /admin/reservations/{id}/approve — 예약 승인
 *      POST /admin/reservations/{id}/cancel  — 예약 취소
 *
 * 03-backend-architecture §1-3 Admin 모듈 구조 준수
 * 03-backend-architecture §5: @Transactional + jpaRepository.save() 명시적 호출
 */
@Service
@RequiredArgsConstructor
public class AdminReservationService implements AdminReservationQueryUseCase, AdminReservationCommandUseCase {

    private final AdminReservationRepositoryPort adminReservationRepositoryPort;
    // 04-domain-collaboration §1: 타 도메인 JpaRepository 조회 전용 허용
    private final UserJpaRepository userJpaRepository;

    // ─────────────────────────────────────────
    // Query
    // ─────────────────────────────────────────

    /**
     * 전체 예약 목록 조회
     *
     * @param status   null = 전체, 값 있음 = 해당 상태만
     * @param pageable 페이지네이션
     */
    @Override
    @Transactional(readOnly = true)
    public Page<AdminReservationResponseDto> getAllReservations(ReservationStatus status, Pageable pageable) {
        return adminReservationRepositoryPort.findAll(status, pageable)
                .map(AdminReservationResponseDto::fromEntity);
    }

    // ─────────────────────────────────────────
    // Command
    // ─────────────────────────────────────────

    /**
     * 예약 승인 (PENDING → APPROVED)
     *
     * - PENDING 상태가 아니면 BusinessException(INVALID_STATUS) 409
     * - 성공 시 approvedBy 설정 후 save() 명시 호출
     */
    @Override
    @Transactional
    public void approveReservation(Long adminId, Long reservationId) {
        ReservationEntity reservation = findOrThrow(reservationId);
        UserEntity admin = userJpaRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        try {
            reservation.approve(admin);
        } catch (IllegalStateException e) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        // 03-backend-architecture §5: 더티 체킹에 의존하지 않고 명시적 save()
        adminReservationRepositoryPort.save(reservation);
    }

    /**
     * 예약 취소 (PENDING | APPROVED → CANCELLED)
     *
     * - COMPLETED/CANCELLED 상태에서 취소 시도 시 BusinessException(INVALID_STATUS) 409
     */
    @Override
    @Transactional
    public void cancelReservation(Long adminId, Long reservationId) {
        ReservationEntity reservation = findOrThrow(reservationId);

        try {
            reservation.cancel();
        } catch (IllegalStateException e) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        adminReservationRepositoryPort.save(reservation);
    }

    // ─────────────────────────────────────────
    // 내부 헬퍼
    // ─────────────────────────────────────────

    private ReservationEntity findOrThrow(Long reservationId) {
        return adminReservationRepositoryPort.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }
}
