package com.coliving.infra.persistence.repository;

import com.coliving.global.entity.ReservationStatus;
import com.coliving.infra.persistence.entity.Reservation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * ReservationRepository 통합 테스트
 * - H2 인메모리 DB를 사용하여 JPA 쿼리 메서드를 검증한다.
 * - @DataJpaTest는 JPA 관련 빈만 로드하므로 가볍게 실행된다.
 */
@DataJpaTest
@Import(TestJpaConfig.class)   // OffsetDateTime용 DateTimeProvider 포함 JPA Auditing 활성화
@ActiveProfiles("default")     // test/resources/application.yml 사용
class ReservationRepositoryTest {

    @Autowired
    private ReservationRepository reservationRepository;

    private static final LocalDate DATE = LocalDate.of(2026, 4, 5);

    @BeforeEach
    void setUp() {
        reservationRepository.deleteAll();
    }

    private Reservation saveReservation(Long userId, Long spaceId,
                                        LocalTime start, LocalTime end) {
        Reservation reservation = Reservation.builder()
                .userId(userId)
                .spaceId(spaceId)
                .reservationDate(DATE)
                .startTime(start)
                .endTime(end)
                .build();
        return reservationRepository.save(reservation);
    }

    // ── 기본 CRUD ──

    @Test
    @DisplayName("예약을 저장하면 ID가 자동 생성된다")
    void save_shouldGenerateId() {
        Reservation reservation = saveReservation(1L, 10L,
                LocalTime.of(10, 0), LocalTime.of(12, 0));

        assertThat(reservation.getId()).isNotNull();
        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.PENDING);
    }

    // ── 사용자별 조회 ──

    @Nested
    @DisplayName("사용자별 예약 조회")
    class FindByUser {

        @Test
        @DisplayName("특정 사용자의 상태별 예약 목록을 조회할 수 있다")
        void findByUserIdAndStatusIn() {
            Reservation pending = saveReservation(1L, 10L,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            Reservation approved = saveReservation(1L, 11L,
                    LocalTime.of(14, 0), LocalTime.of(16, 0));
            approved.approve(100L);
            reservationRepository.save(approved);

            // 다른 사용자 예약
            saveReservation(2L, 10L, LocalTime.of(10, 0), LocalTime.of(12, 0));

            List<Reservation> results = reservationRepository.findByUserIdAndStatusIn(
                    1L, List.of(ReservationStatus.PENDING, ReservationStatus.APPROVED));

            assertThat(results).hasSize(2);
        }

        @Test
        @DisplayName("특정 사용자의 전체 예약을 최신순으로 조회할 수 있다")
        void findByUserIdOrderByReservationDateDescStartTimeDesc() {
            saveReservation(1L, 10L, LocalTime.of(10, 0), LocalTime.of(12, 0));
            saveReservation(1L, 11L, LocalTime.of(14, 0), LocalTime.of(16, 0));

            List<Reservation> results =
                    reservationRepository.findByUserIdOrderByReservationDateDescStartTimeDesc(1L);

            assertThat(results).hasSize(2);
            // 같은 날짜이므로 startTime 기준 내림차순 → 14:00 먼저
            assertThat(results.get(0).getStartTime()).isEqualTo(LocalTime.of(14, 0));
        }
    }

    // ── 시설별 조회 ──

    @Test
    @DisplayName("특정 시설의 특정 날짜 승인된 예약만 조회할 수 있다")
    void findBySpaceIdAndReservationDateAndStatus() {
        Reservation approved = saveReservation(1L, 10L,
                LocalTime.of(10, 0), LocalTime.of(12, 0));
        approved.approve(100L);
        reservationRepository.save(approved);

        saveReservation(2L, 10L, LocalTime.of(14, 0), LocalTime.of(16, 0)); // PENDING

        List<Reservation> results = reservationRepository
                .findBySpaceIdAndReservationDateAndStatus(10L, DATE, ReservationStatus.APPROVED);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo(ReservationStatus.APPROVED);
    }

    // ── 중복 예약 체크 ──

    @Nested
    @DisplayName("existsOverlappingReservation() - 시간대 중복 체크")
    class OverlapCheck {

        @Test
        @DisplayName("시간이 겹치는 APPROVED 예약이 있으면 true를 반환한다")
        void overlapping_shouldReturnTrue() {
            // 기존 예약: 10:00 ~ 12:00 (APPROVED)
            Reservation existing = saveReservation(1L, 10L,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            existing.approve(100L);
            reservationRepository.save(existing);

            // 새 예약 시도: 11:00 ~ 13:00 (겹침)
            boolean overlaps = reservationRepository.existsOverlappingReservation(
                    10L, DATE, LocalTime.of(11, 0), LocalTime.of(13, 0));

            assertThat(overlaps).isTrue();
        }

        @Test
        @DisplayName("시간이 겹치지 않으면 false를 반환한다")
        void noOverlap_shouldReturnFalse() {
            Reservation existing = saveReservation(1L, 10L,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            existing.approve(100L);
            reservationRepository.save(existing);

            // 새 예약 시도: 12:00 ~ 14:00 (안 겹침 - 경계)
            boolean overlaps = reservationRepository.existsOverlappingReservation(
                    10L, DATE, LocalTime.of(12, 0), LocalTime.of(14, 0));

            assertThat(overlaps).isFalse();
        }

        @Test
        @DisplayName("PENDING 상태 예약은 중복 체크 대상이 아니다")
        void pendingReservation_shouldNotOverlap() {
            // PENDING 상태 예약: 10:00 ~ 12:00
            saveReservation(1L, 10L, LocalTime.of(10, 0), LocalTime.of(12, 0));

            // 같은 시간대 중복 체크 → APPROVED만 체크하므로 false
            boolean overlaps = reservationRepository.existsOverlappingReservation(
                    10L, DATE, LocalTime.of(10, 0), LocalTime.of(12, 0));

            assertThat(overlaps).isFalse();
        }
    }

    // ── 활성 예약 확인 ──

    @Nested
    @DisplayName("hasActiveReservation() - 현재 활성 예약 확인")
    class ActiveReservation {

        @Test
        @DisplayName("현재 시각이 예약 시간 범위 안에 있으면 true를 반환한다")
        void withinTimeRange_shouldReturnTrue() {
            Reservation reservation = saveReservation(1L, 10L,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            reservation.approve(100L);
            reservationRepository.save(reservation);

            boolean active = reservationRepository.hasActiveReservation(
                    1L, 10L, DATE, LocalTime.of(11, 0));

            assertThat(active).isTrue();
        }

        @Test
        @DisplayName("현재 시각이 예약 시간 범위 밖이면 false를 반환한다")
        void outsideTimeRange_shouldReturnFalse() {
            Reservation reservation = saveReservation(1L, 10L,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            reservation.approve(100L);
            reservationRepository.save(reservation);

            boolean active = reservationRepository.hasActiveReservation(
                    1L, 10L, DATE, LocalTime.of(13, 0));

            assertThat(active).isFalse();
        }
    }

    // ── 기간별 조회 ──

    @Test
    @DisplayName("특정 시설의 기간별 예약 목록을 날짜/시간 순으로 조회할 수 있다")
    void findBySpaceIdAndDateRange() {
        saveReservation(1L, 10L, LocalTime.of(10, 0), LocalTime.of(12, 0));

        // 범위 밖 날짜 예약
        Reservation outOfRange = Reservation.builder()
                .userId(1L).spaceId(10L)
                .reservationDate(LocalDate.of(2026, 5, 1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .build();
        reservationRepository.save(outOfRange);

        List<Reservation> results = reservationRepository.findBySpaceIdAndDateRange(
                10L, DATE, DATE.plusDays(7));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getReservationDate()).isEqualTo(DATE);
    }
}
