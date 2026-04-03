package com.coliving.reservation.adapter.out.jpa;

import com.coliving.reservation.config.TestJpaConfig;
import com.coliving.reservation.model.ReservationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ReservationJpaRepository 통합 테스트
 *
 * H2 인메모리 DB + @DataJpaTest로 JPA 쿼리를 검증한다.
 * TestJpaConfig를 Import하여 OffsetDateTime Auditing을 지원한다.
 */
@DataJpaTest
@Import(TestJpaConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class ReservationJpaRepositoryTest {

    @Autowired
    private ReservationJpaRepository repository;

    // ── 테스트 상수 ──
    private static final Long USER_A = 1L;
    private static final Long USER_B = 2L;
    private static final Long SPACE_1 = 10L;
    private static final Long SPACE_2 = 20L;
    private static final Long ADMIN_ID = 99L;
    private static final LocalDate TODAY = LocalDate.of(2026, 4, 10);
    private static final LocalDate TOMORROW = LocalDate.of(2026, 4, 11);

    @BeforeEach
    void setUp() {
        repository.deleteAllInBatch();
    }

    private ReservationEntity createAndSave(Long userId, Long spaceId, LocalDate date,
                                            LocalTime start, LocalTime end) {
        return repository.save(ReservationEntity.builder()
                .userId(userId)
                .spaceId(spaceId)
                .reservationDate(date)
                .startTime(start)
                .endTime(end)
                .build());
    }

    @Nested
    @DisplayName("기본 CRUD 테스트")
    class CrudTest {

        @Test
        @DisplayName("저장 시 ID 자동 생성 및 초기 상태 PENDING")
        void shouldSaveAndGenerateId() {
            ReservationEntity saved = createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));

            assertAll(
                    () -> assertNotNull(saved.getId()),
                    () -> assertEquals(ReservationStatus.PENDING, saved.getStatus()),
                    () -> assertNotNull(saved.getCreatedAt())
            );
        }
    }

    @Nested
    @DisplayName("사용자별 조회 테스트")
    class UserQueryTest {

        @Test
        @DisplayName("상태 필터링 조회: PENDING/APPROVED만 반환")
        void shouldFilterByStatus() {
            // USER_A의 예약 3건: PENDING, APPROVED, CANCELLED
            ReservationEntity pending = createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(11, 0));

            ReservationEntity approved = createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(13, 0), LocalTime.of(14, 0));
            approved.approve(ADMIN_ID);
            repository.save(approved);

            ReservationEntity cancelled = createAndSave(USER_A, SPACE_1, TOMORROW,
                    LocalTime.of(10, 0), LocalTime.of(11, 0));
            cancelled.cancel();
            repository.save(cancelled);

            List<ReservationEntity> result = repository.findByUserIdAndStatusIn(
                    USER_A, List.of(ReservationStatus.PENDING, ReservationStatus.APPROVED));

            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("최신순 정렬 조회")
        void shouldOrderByDateDesc() {
            createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(11, 0));
            createAndSave(USER_A, SPACE_1, TOMORROW,
                    LocalTime.of(14, 0), LocalTime.of(15, 0));

            List<ReservationEntity> result =
                    repository.findByUserIdOrderByReservationDateDescStartTimeDesc(USER_A);

            assertEquals(2, result.size());
            assertTrue(result.get(0).getReservationDate().isAfter(result.get(1).getReservationDate())
                    || result.get(0).getReservationDate().isEqual(result.get(1).getReservationDate()));
        }
    }

    @Nested
    @DisplayName("시설별 조회 테스트")
    class SpaceQueryTest {

        @Test
        @DisplayName("특정 시설의 APPROVED 예약만 조회")
        void shouldFilterApprovedBySpace() {
            ReservationEntity approved = createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(11, 0));
            approved.approve(ADMIN_ID);
            repository.save(approved);

            createAndSave(USER_B, SPACE_1, TODAY,
                    LocalTime.of(13, 0), LocalTime.of(14, 0));  // PENDING

            List<ReservationEntity> result = repository.findBySpaceIdAndReservationDateAndStatus(
                    SPACE_1, TODAY, ReservationStatus.APPROVED);

            assertEquals(1, result.size());
            assertEquals(ReservationStatus.APPROVED, result.get(0).getStatus());
        }
    }

    @Nested
    @DisplayName("중복 예약 체크 테스트")
    class OverlapTest {

        @Test
        @DisplayName("시간 겹침 → 중복으로 판정 (true)")
        void shouldDetectOverlap() {
            // 기존 예약: 10:00 ~ 12:00 (APPROVED)
            ReservationEntity existing = createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            existing.approve(ADMIN_ID);
            repository.save(existing);

            // 새 예약: 11:00 ~ 13:00 (겹침)
            boolean overlap = repository.existsOverlappingReservation(
                    SPACE_1, TODAY, LocalTime.of(11, 0), LocalTime.of(13, 0));

            assertTrue(overlap);
        }

        @Test
        @DisplayName("경계값 연속 → 중복 아님 (false)")
        void shouldNotDetectOverlapAtBoundary() {
            // 기존 예약: 10:00 ~ 12:00 (APPROVED)
            ReservationEntity existing = createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            existing.approve(ADMIN_ID);
            repository.save(existing);

            // 새 예약: 12:00 ~ 14:00 (경계값, 겹치지 않음)
            boolean overlap = repository.existsOverlappingReservation(
                    SPACE_1, TODAY, LocalTime.of(12, 0), LocalTime.of(14, 0));

            assertFalse(overlap);
        }

        @Test
        @DisplayName("PENDING 상태 예약은 중복 체크에서 제외 (false)")
        void shouldIgnorePendingReservations() {
            // 기존 예약: 10:00 ~ 12:00 (PENDING)
            createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));

            boolean overlap = repository.existsOverlappingReservation(
                    SPACE_1, TODAY, LocalTime.of(11, 0), LocalTime.of(13, 0));

            assertFalse(overlap);
        }
    }

    @Nested
    @DisplayName("활성 예약 확인 테스트")
    class ActiveReservationTest {

        @Test
        @DisplayName("시간 범위 내 → 활성 예약 존재 (true)")
        void shouldDetectActiveReservation() {
            ReservationEntity reservation = createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            reservation.approve(ADMIN_ID);
            repository.save(reservation);

            boolean active = repository.hasActiveReservation(
                    USER_A, SPACE_1, TODAY, LocalTime.of(11, 0));

            assertTrue(active);
        }

        @Test
        @DisplayName("시간 범위 외 → 활성 예약 없음 (false)")
        void shouldNotDetectActiveReservationOutside() {
            ReservationEntity reservation = createAndSave(USER_A, SPACE_1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            reservation.approve(ADMIN_ID);
            repository.save(reservation);

            boolean active = repository.hasActiveReservation(
                    USER_A, SPACE_1, TODAY, LocalTime.of(13, 0));

            assertFalse(active);
        }
    }

    @Nested
    @DisplayName("기간별 조회 테스트")
    class DateRangeTest {

        @Test
        @DisplayName("날짜 범위 필터 + 정렬 확인")
        void shouldFilterByDateRange() {
            LocalDate day1 = LocalDate.of(2026, 4, 7);
            LocalDate day2 = LocalDate.of(2026, 4, 9);
            LocalDate day3 = LocalDate.of(2026, 4, 14);

            createAndSave(USER_A, SPACE_1, day1, LocalTime.of(10, 0), LocalTime.of(11, 0));
            createAndSave(USER_A, SPACE_1, day2, LocalTime.of(14, 0), LocalTime.of(15, 0));
            createAndSave(USER_A, SPACE_1, day3, LocalTime.of(10, 0), LocalTime.of(11, 0));

            // 4/7 ~ 4/13 범위 조회 → 2건 (day1, day2)
            List<ReservationEntity> result = repository.findBySpaceIdAndDateRange(
                    SPACE_1, LocalDate.of(2026, 4, 7), LocalDate.of(2026, 4, 13));

            assertEquals(2, result.size());
            // 날짜순 정렬 확인
            assertTrue(result.get(0).getReservationDate().isBefore(result.get(1).getReservationDate())
                    || result.get(0).getReservationDate().isEqual(result.get(1).getReservationDate()));
        }
    }
}
