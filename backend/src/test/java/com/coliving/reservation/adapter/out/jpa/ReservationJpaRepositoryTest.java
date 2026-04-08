package com.coliving.reservation.adapter.out.jpa;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.model.Gender;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.reservation.config.TestJpaConfig;
import com.coliving.reservation.model.ReservationStatus;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;
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
 *
 * [SPC-2.1 + USR-1.1 머지 완료]
 * - UserEntity, SpaceEntity를 실제 JPA 저장 후 연관관계 매핑 테스트
 */
@DataJpaTest
@Import(TestJpaConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@SuppressWarnings("null")
class ReservationJpaRepositoryTest {

    @Autowired
    private ReservationJpaRepository repository;

    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private SpaceJpaRepository spaceRepository;

    // ── 테스트 픽스처 ──
    private UserEntity userA;
    private UserEntity userB;
    private UserEntity admin;
    private SpaceEntity space1;

    private static final LocalDate TODAY = LocalDate.of(2026, 4, 10);
    private static final LocalDate TOMORROW = LocalDate.of(2026, 4, 11);

    @BeforeEach
    void setUp() {
        repository.deleteAllInBatch();
        spaceRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        userA = userRepository.save(UserEntity.builder()
                .loginId("userA")
                .passwordHash("hash")
                .name("유저A")
                .birthDate("000101")
                .gender(Gender.MALE)
                .nationality("Korean")
                .phone("010-0000-0001")
                .email("a@coliving.com")
                .role(UserRole.RESIDENT)
                .status(UserStatus.ACTIVE)
                .build());

        userB = userRepository.save(UserEntity.builder()
                .loginId("userB")
                .passwordHash("hash")
                .name("유저B")
                .birthDate("000101")
                .gender(Gender.FEMALE)
                .nationality("Korean")
                .phone("010-0000-0002")
                .email("b@coliving.com")
                .role(UserRole.RESIDENT)
                .status(UserStatus.ACTIVE)
                .build());

        admin = userRepository.save(UserEntity.builder()
                .loginId("admin")
                .passwordHash("hash")
                .name("관리자")
                .birthDate("000101")
                .gender(Gender.MALE)
                .nationality("Korean")
                .phone("010-9999-9999")
                .email("admin@coliving.com")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        space1 = spaceRepository.save(SpaceEntity.builder()
                .name("회의실 A")
                .type(SpaceType.COMMON)
                .status(SpaceStatus.AVAILABLE)
                .floor(1)
                .build());
    }

    private ReservationEntity createAndSave(UserEntity user, SpaceEntity space, LocalDate date,
                                            LocalTime start, LocalTime end) {
        return repository.save(ReservationEntity.builder()
                .user(user)
                .space(space)
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
            ReservationEntity saved = createAndSave(userA, space1, TODAY,
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
            // userA의 예약 3건: PENDING, APPROVED, CANCELLED
            createAndSave(userA, space1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(11, 0));

            ReservationEntity approved = createAndSave(userA, space1, TODAY,
                    LocalTime.of(13, 0), LocalTime.of(14, 0));
            approved.approve(admin);
            repository.save(approved);

            ReservationEntity cancelled = createAndSave(userA, space1, TOMORROW,
                    LocalTime.of(10, 0), LocalTime.of(11, 0));
            cancelled.cancel();
            repository.save(cancelled);

            List<ReservationEntity> result = repository.findByUser_UserIdAndStatusIn(
                    userA.getUserId(), List.of(ReservationStatus.PENDING, ReservationStatus.APPROVED));

            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("최신순 정렬 조회")
        void shouldOrderByDateDesc() {
            createAndSave(userA, space1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(11, 0));
            createAndSave(userA, space1, TOMORROW,
                    LocalTime.of(14, 0), LocalTime.of(15, 0));

            List<ReservationEntity> result =
                    repository.findByUser_UserIdOrderByReservationDateDescStartTimeDesc(userA.getUserId());

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
            ReservationEntity approved = createAndSave(userA, space1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(11, 0));
            approved.approve(admin);
            repository.save(approved);

            createAndSave(userB, space1, TODAY,
                    LocalTime.of(13, 0), LocalTime.of(14, 0));  // PENDING

            List<ReservationEntity> result = repository.findBySpace_SpaceIdAndReservationDateAndStatus(
                    space1.getSpaceId(), TODAY, ReservationStatus.APPROVED);

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
            ReservationEntity existing = createAndSave(userA, space1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            existing.approve(admin);
            repository.save(existing);

            // 새 예약: 11:00 ~ 13:00 (겹침)
            boolean overlap = repository.existsOverlappingReservation(
                    space1.getSpaceId(), TODAY, LocalTime.of(11, 0), LocalTime.of(13, 0));

            assertTrue(overlap);
        }

        @Test
        @DisplayName("경계값 연속 → 중복 아님 (false)")
        void shouldNotDetectOverlapAtBoundary() {
            // 기존 예약: 10:00 ~ 12:00 (APPROVED)
            ReservationEntity existing = createAndSave(userA, space1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            existing.approve(admin);
            repository.save(existing);

            // 새 예약: 12:00 ~ 14:00 (경계값, 겹치지 않음)
            boolean overlap = repository.existsOverlappingReservation(
                    space1.getSpaceId(), TODAY, LocalTime.of(12, 0), LocalTime.of(14, 0));

            assertFalse(overlap);
        }

        @Test
        @DisplayName("PENDING 상태 예약은 중복 체크에서 제외 (false)")
        void shouldIgnorePendingReservations() {
            // 기존 예약: 10:00 ~ 12:00 (PENDING)
            createAndSave(userA, space1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));

            boolean overlap = repository.existsOverlappingReservation(
                    space1.getSpaceId(), TODAY, LocalTime.of(11, 0), LocalTime.of(13, 0));

            assertFalse(overlap);
        }
    }

    @Nested
    @DisplayName("활성 예약 확인 테스트")
    class ActiveReservationTest {

        @Test
        @DisplayName("시간 범위 내 → 활성 예약 존재 (true)")
        void shouldDetectActiveReservation() {
            ReservationEntity reservation = createAndSave(userA, space1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            reservation.approve(admin);
            repository.save(reservation);

            boolean active = repository.hasActiveReservation(
                    userA.getUserId(), space1.getSpaceId(), TODAY, LocalTime.of(11, 0));

            assertTrue(active);
        }

        @Test
        @DisplayName("시간 범위 외 → 활성 예약 없음 (false)")
        void shouldNotDetectActiveReservationOutside() {
            ReservationEntity reservation = createAndSave(userA, space1, TODAY,
                    LocalTime.of(10, 0), LocalTime.of(12, 0));
            reservation.approve(admin);
            repository.save(reservation);

            boolean active = repository.hasActiveReservation(
                    userA.getUserId(), space1.getSpaceId(), TODAY, LocalTime.of(13, 0));

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

            createAndSave(userA, space1, day1, LocalTime.of(10, 0), LocalTime.of(11, 0));
            createAndSave(userA, space1, day2, LocalTime.of(14, 0), LocalTime.of(15, 0));
            createAndSave(userA, space1, day3, LocalTime.of(10, 0), LocalTime.of(11, 0));

            // 4/7 ~ 4/13 범위 조회 → 2건 (day1, day2)
            List<ReservationEntity> result = repository.findBySpaceIdAndDateRange(
                    space1.getSpaceId(), LocalDate.of(2026, 4, 7), LocalDate.of(2026, 4, 13));

            assertEquals(2, result.size());
            // 날짜순 정렬 확인
            assertTrue(result.get(0).getReservationDate().isBefore(result.get(1).getReservationDate())
                    || result.get(0).getReservationDate().isEqual(result.get(1).getReservationDate()));
        }
    }
}
