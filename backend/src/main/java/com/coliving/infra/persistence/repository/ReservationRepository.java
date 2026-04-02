package com.coliving.infra.persistence.repository;

import com.coliving.global.entity.ReservationStatus;
import com.coliving.infra.persistence.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * 시설 예약 Repository
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ [TODO - 머지 시 수정 필요]                                        │
 * │                                                                  │
 * │ User/Space 엔티티 완성 후 @ManyToOne 전환 시,                     │
 * │ 쿼리 메서드의 파라미터 타입과 반환 타입을 검토하세요.                  │
 * │ 예: findByUserId → findByUser(User user) 등                      │
 * │                                                                  │
 * │ 관련 담당: User(팀원1 USR-1.1), Space(팀원2 SPC-2.1)              │
 * └──────────────────────────────────────────────────────────────────┘
 */
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // 특정 사용자의 예약 목록 조회 (상태 필터링)
    List<Reservation> findByUserIdAndStatusIn(Long userId, List<ReservationStatus> statuses);

    // 특정 사용자의 전체 예약 목록 조회 (최신순)
    List<Reservation> findByUserIdOrderByReservationDateDescStartTimeDesc(Long userId);

    // 특정 시설의 특정 날짜 예약 목록 조회 (승인된 예약만)
    List<Reservation> findBySpaceIdAndReservationDateAndStatus(
            Long spaceId, LocalDate reservationDate, ReservationStatus status);

    // 특정 시설의 특정 날짜 전체 예약 목록 조회
    List<Reservation> findBySpaceIdAndReservationDate(Long spaceId, LocalDate reservationDate);

    /**
     * 예약 시간대 중복 체크 (비즈니스 규칙 #10)
     * - 동일 시설, 동일 날짜에 APPROVED 상태인 예약 중 시간이 겹치는 건이 있는지 확인
     * - 새 예약의 시작 < 기존 종료 AND 새 예약의 종료 > 기존 시작 이면 중복
     */
    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
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
     * - 공용 기기 제어 권한 검증에 사용 (비즈니스 규칙 #9)
     */
    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
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

    // 특정 시설의 특정 기간 예약 목록 조회 (타임테이블 UI용, RSV-4.3)
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.spaceId = :spaceId " +
           "AND r.reservationDate BETWEEN :startDate AND :endDate " +
           "ORDER BY r.reservationDate, r.startTime")
    List<Reservation> findBySpaceIdAndDateRange(
            @Param("spaceId") Long spaceId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
