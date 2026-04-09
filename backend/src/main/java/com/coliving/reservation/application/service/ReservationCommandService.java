package com.coliving.reservation.application.service;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.reservation.adapter.in.web.dto.req.ReservationCreateRequestDto;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.application.port.in.ReservationCommandUseCase;
import com.coliving.reservation.exception.ReservationOverlapException;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractStatus;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

/**
 * 예약 쓰기(Command) 서비스
 *
 * #80 예약 동시성 차단 신청 로직
 * #81 예약 조회 및 취소 롤백
 *
 * 03-backend-architecture §5:
 *   - @Transactional 명시
 *   - jpaRepository.save(entity) 명시적 호출 (더티 체킹 의존 금지)
 *   - IllegalStateException → BusinessException(INVALID_STATUS)로 변환
 */
@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReservationCommandService implements ReservationCommandUseCase {

    private static final long MAX_RESERVATION_MINUTES = 120;

    private final ReservationJpaRepository reservationRepository;
    private final UserJpaRepository userRepository;
    private final SpaceJpaRepository spaceRepository;
    private final ContractJpaRepository contractJpaRepository;

    /**
     * 시설 예약 신청
     *
     * 처리 순서:
     * 1. 시간 범위 유효성 검사 (종료 > 시작)
     * 2. 사용자 조회
     * 3. 시설 조회
     * 4. 활성 계약 종료일(endDate) 검증
     * 5. 최대 이용 시간(2시간) 검증
     * 6. 동시성 체크 — 동일 시설/날짜/시간대에 APPROVED 예약 존재 시 ReservationOverlapException
     * 7. 엔티티 생성(APPROVED) 및 저장
     */
    @Override
    @Transactional
    public Long reserveFacility(Long userId, ReservationCreateRequestDto request) {
        // 1. 시간 범위 유효성 검사
        if (!request.isValidTimeRange()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "종료 시간은 시작 시간보다 이후여야 합니다.");
        }

        // 2. 요청 사용자 조회
        Objects.requireNonNull(userId, "userId는 null일 수 없습니다.");
        @SuppressWarnings("null")
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 3. 시설 조회 (SpaceJpaRepository 직접 사용 — 04-domain-collaboration: 읽기만 허용)
        SpaceEntity spaceEntity = spaceRepository.findById(request.getSpaceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "시설을 찾을 수 없습니다."));

        // 4. 활성 계약 종료일 검증 (종료일 당일 포함)
        ContractEntity activeContract = contractJpaRepository.findByUserIdAndStatus(userId, ContractStatus.ACTIVE)
                .stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.NO_ACTIVE_CONTRACT, "유효한 활성 계약이 없어 예약할 수 없습니다."));

        if (activeContract.getEndDate() == null) {
            throw new BusinessException(ErrorCode.NO_ACTIVE_CONTRACT, "유효한 활성 계약 종료일이 없어 예약할 수 없습니다.");
        }

        if (request.getReservationDate().isAfter(activeContract.getEndDate())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "입주 기간 종료로 인해 예약이 불가능합니다");
        }

        // 5. 최대 이용 시간(2시간) 검증
        if (!request.isWithinMaxUsageMinutes(MAX_RESERVATION_MINUTES)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "공용시설 예약은 최대 2시간까지만 가능합니다.");
        }

        // 6. 동시성 체크: 해당 시간에 APPROVED 중복 예약 여부 확인
        // TODO: (고도화) 다중 인스턴스 환경에서 완벽한 동시성 제어를 위해 Redisson 분산 락, DB Partial Unique Index 도입 고려
        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                request.getSpaceId(),
                request.getReservationDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (hasOverlap) {
            log.warn("예약 충돌 발생 - spaceId: {}, date: {}, time: {}~{}",
                    request.getSpaceId(), request.getReservationDate(),
                    request.getStartTime(), request.getEndTime());
            throw new ReservationOverlapException("선택한 시간에 이미 다른 확정된 예약이 존재합니다.");
        }

        // 7. 예약 엔티티 생성 (초기 상태: APPROVED) 및 저장
        @SuppressWarnings("null")
        ReservationEntity savedReservation = reservationRepository.save(
                ReservationEntity.builder()
                        .user(userEntity)
                        .space(spaceEntity)
                        .reservationDate(request.getReservationDate())
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .build()
        );

        log.info("새로운 예약 성공 - reservationId: {}, spaceId: {}, userId: {}",
                savedReservation.getId(), savedReservation.getSpaceId(), savedReservation.getUserId());

        return savedReservation.getId();
    }

    /**
     * 예약 취소 (#81 핵심)
     *
     * - 본인 예약만 취소 가능 (소유권 검증)
     * - PENDING/APPROVED 상태만 취소 가능
     * - COMPLETED/CANCELLED 상태에서 시도 시 → BusinessException(INVALID_STATUS) 409
     * - 성공 시 status=CANCELLED, jpaRepository.save() 명시 호출
     */
    @Override
    @Transactional
    public void cancelReservation(Long userId, Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "예약을 찾을 수 없습니다."));

        // 소유권 검증
        if (!reservation.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인의 예약만 취소할 수 있습니다.");
        }

        // 상태 전환 (COMPLETED/CANCELLED → IllegalStateException → INVALID_STATUS 409)
        try {
            reservation.cancel();
        } catch (IllegalStateException e) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, e.getMessage());
        }

        // 03-backend-architecture §5: 더티 체킹 의존 금지, save() 명시 호출
        reservationRepository.save(reservation);
        log.info("예약 취소 성공 - reservationId: {}, userId: {}", reservationId, userId);
    }

    /**
     * [관리자] 예약 승인 (#82, #83에서 관리자 전용 UseCase로 분리 예정)
     *
     * PENDING → APPROVED + approvedBy 기록
     */
    @Override
    @Transactional
    public void approveReservation(Long adminId, Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "예약을 찾을 수 없습니다."));

        UserEntity adminEntity = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "관리자를 찾을 수 없습니다."));

        try {
            reservation.approve(adminEntity);
        } catch (IllegalStateException e) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, e.getMessage());
        }

        // 03-backend-architecture §5: save() 명시 호출
        reservationRepository.save(reservation);
        log.info("예약 승인 성공 - reservationId: {}, adminId: {}", reservationId, adminId);
    }

    /**
     * [관리자] 예약 반려 (#82, #83에서 관리자 전용 UseCase로 분리 예정)
     *
     * PENDING/APPROVED → CANCELLED
     */
    @Override
    @Transactional
    public void rejectReservation(Long adminId, Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "예약을 찾을 수 없습니다."));

        try {
            reservation.cancel();
        } catch (IllegalStateException e) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, e.getMessage());
        }

        // 03-backend-architecture §5: save() 명시 호출
        reservationRepository.save(reservation);
        log.info("예약 반려(취소) 성공 - reservationId: {}, adminId: {}", reservationId, adminId);
    }
}
