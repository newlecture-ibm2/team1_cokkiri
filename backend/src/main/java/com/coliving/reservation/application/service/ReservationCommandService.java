package com.coliving.reservation.application.service;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.reservation.adapter.in.web.dto.ReservationCreateRequest;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.application.port.in.ReservationCommandUseCase;
import com.coliving.reservation.exception.ReservationOverlapException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

/**
 * 예약 생성 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationCommandService implements ReservationCommandUseCase {

    private final ReservationJpaRepository reservationRepository;
    private final UserJpaRepository userRepository;

    @Override
    @Transactional
    public Long reserveFacility(Long userId, ReservationCreateRequest request) {
        // 1. 시간 범위 유효성 검사
        if (!request.isValidTimeRange()) {
            throw new IllegalArgumentException("종료 시간은 시작 시간보다 이후여야 합니다.");
        }

        // 2. 요청 사용자 조회 (USR-1.1 ManyToOne 전환 완료)
        Objects.requireNonNull(userId, "userId는 null일 수 없습니다.");
        @SuppressWarnings("null")
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 3. 동시성 체크: 해당 시간에 승인(APPROVED)된 중복 예약이 있는지 확인
        // TODO: (고도화) 다중 인스턴스 환경에서 완벽한 동시성 제어를 위해 Redisson 기반 분산 락, 또는 DB 유니크 제약/비관적 락 도입 고려
        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                request.getSpaceId(),
                request.getReservationDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (hasOverlap) {
            log.warn("예약 충돌 발생 - spaceId: {}, date: {}, time: {}~{}",
                    request.getSpaceId(), request.getReservationDate(), request.getStartTime(), request.getEndTime());
            throw new ReservationOverlapException("선택한 시간에 이미 다른 확정된 예약이 존재합니다.");
        }

        // 4. 예약 엔티티 생성 (초기 상태: PENDING)
        ReservationEntity newReservation = ReservationEntity.builder()
                .user(userEntity)
                .spaceId(request.getSpaceId())
                .reservationDate(request.getReservationDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        // 5. 저장 및 ID 반환
        @SuppressWarnings("null")
        ReservationEntity savedReservation = reservationRepository.save(newReservation);

        log.info("새로운 예약 성공 - reservationId: {}, spaceId: {}, userId: {}",
                savedReservation.getId(), savedReservation.getSpaceId(), savedReservation.getUserId());

        return savedReservation.getId();
    }

    @Override
    @Transactional
    public void cancelReservation(Long userId, Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "예약을 찾을 수 없습니다."));

        if (!reservation.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인의 예약만 취소할 수 있습니다.");
        }

        reservation.cancel();
        log.info("예약 취소 성공 - reservationId: {}, userId: {}", reservationId, userId);
    }

    @Override
    @Transactional
    public void approveReservation(Long adminId, Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "예약을 찾을 수 없습니다."));

        reservation.approve(adminId);
        log.info("예약 승인 성공 - reservationId: {}, adminId: {}", reservationId, adminId);
    }

    @Override
    @Transactional
    public void rejectReservation(Long adminId, Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "예약을 찾을 수 없습니다."));

        // Entity의 cancel() 메서드가 PENDING, APPROVED 상태에서 CANCELLED로 전환되도록 보장함
        reservation.cancel();
        log.info("예약 반려(취소) 성공 - reservationId: {}, adminId: {}", reservationId, adminId);
    }
}
