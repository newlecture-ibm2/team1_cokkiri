package com.coliving.reservation.adapter.out.jpa;

import com.coliving.reservation.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * 시설 예약 JPA Repository
 *
 * reservation 테이블에 대한 데이터 접근을 담당한다.
 * 주요 쿼리 메서드는 비즈니스 규칙(ERD)에 기반한다.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ [TODO - SPC-2.1/USR-1.1 머지 시 수정 필요]                       │
 * │                                                                  │
 * │ User/Space 엔티티 완성 후 @ManyToOne 전환 시,                     │
 * │ 쿼리 메서드의 파라미터 타입과 반환 타입을 검토하세요.                  │
 * │ 예: findByUserId → findByUser(User user) 등                      │
 * │                                                                  │
 * │ 관련 담당: User(이우석 USR-1.1), Space(정찬우 SPC-2.1)             │
 * └──────────────────────────────────────────────────────────────────┘
 */
public interface ReservationJpaRepository extends JpaRepository<ReservationEntity, Long> {

    // ── 사용자별 조회 ──

    /** 특정 사용자의 예약 목록 조회 (상태 필터링) */
    List<ReservationEntity> findByUserIdAndStatusIn(Long userId, List<ReservationStatus> statuses);

    /** 특정 사용자의 전체 예약 목록 조회 (최신순 정렬) */
    List<ReservationEntity> findByUserIdOrderByReservationDateDescStartTimeDesc(Long userId);

    // ── 시설별 조회 ──

    /** 특정 시설의 특정 날짜 예약 목록 조회 (승인된 예약만) */
    List<ReservationEntity> findBySpaceIdAndReservationDateAndStatus(
            Long spaceId, LocalDate reservationDate, ReservationStatus status);

    /** 특정 시설의 특정 날짜 전체 예약 목록 조회 */
    List<ReservationEntity> findBySpaceIdAndReservationDate(Long spaceId, LocalDate reservationDate);

    // ── 비즈니스 규칙 검증 쿼리 ──

    /**
     * 예약 시간대 중복 체크 (비즈니스 규칙 #10)
     *
     * 동일 시설, 동일 날짜에 APPROVED 상태인 예약 중 시간이 겹치는 건이 있는지 확인한다.
     * 중복 판정 조건: 새 예약의 시작 < 기존 종료 AND 새 예약의 종료 > 기존 시작
     *
     * @param spaceId   시설 ID
     * @param date      예약 날짜
     * @param startTime 시작 시간
     * @param endTime   종료 시간
     * @return 중복 예약 존재 여부
     */
    @Query("SELECT COUNT(r) > 0 FROM ReservationEntity r " +
           "WHERE r.spaceId = :spaceId " +
           "AND r.reservationDate = :date " +
           "AND r.status = 'APPROVED' " +
           "AND r.startTime < :endTime " +
           "AND r.endTime > :startTime")
    boolean existsOverlappingReservation(
            @Param("spaceId") Long spaceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    /**
     * 특정 사용자가 특정 시설에 현재 시각 기준 유효한 APPROVED 예약이 있는지 확인
     *
     * 공용 기기 제어 권한 검증에 사용한다. (비즈니스 규칙 #9)
     * 예약 날짜 + 시간 범위 안에 있어야 제어 가능.
     *
     * @param userId      사용자 ID
     * @param spaceId     시설 ID
     * @param date        현재 날짜
     * @param currentTime 현재 시간
     * @return 활성 예약 존재 여부
     */
    @Query("SELECT COUNT(r) > 0 FROM ReservationEntity r " +
           "WHERE r.userId = :userId " +
           "AND r.spaceId = :spaceId " +
           "AND r.reservationDate = :date " +
           "AND r.status = 'APPROVED' " +
           "AND r.startTime <= :currentTime " +
           "AND r.endTime > :currentTime")
    boolean hasActiveReservation(
            @Param("userId") Long userId,
            @Param("spaceId") Long spaceId,
            @Param("date") LocalDate date,
            @Param("currentTime") LocalTime currentTime);

    /**
     * 특정 시설의 기간별 예약 목록 조회 (RSV-4.3 타임테이블 UI용)
     *
     * 주단위 캘린더에서 해당 시설의 예약 현황을 보여주기 위해 사용한다.
     * 날짜 + 시작시간 순으로 정렬하여 반환한다.
     *
     * @param spaceId   시설 ID
     * @param startDate 조회 시작일
     * @param endDate   조회 종료일
     * @return 날짜/시간순 정렬된 예약 목록
     */
    @Query("SELECT r FROM ReservationEntity r " +
           "WHERE r.spaceId = :spaceId " +
           "AND r.reservationDate BETWEEN :startDate AND :endDate " +
           "ORDER BY r.reservationDate, r.startTime")
    List<ReservationEntity> findBySpaceIdAndDateRange(
            @Param("spaceId") Long spaceId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
