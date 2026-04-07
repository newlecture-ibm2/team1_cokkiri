package com.coliving.reservation.adapter.out.jpa;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.model.Gender;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.reservation.model.ReservationStatus;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ReservationEntity 단위 테스트
 *
 * DB 없이 순수 Java 로직만 검증한다.
 * 상태 전환 비즈니스 메서드(approve, cancel, complete)와
 * Builder 생성을 테스트한다.
 *
 * [SPC-2.1 + USR-1.1 머지 완료]
 * - user, space, approvedBy 모두 @ManyToOne 전환
 * - 테스트용 UserEntity/SpaceEntity는 Reflection 없이 Builder로 생성
 */
class ReservationEntityTest {

    // ── 테스트 데이터 상수 ──
    private static final LocalDate DATE = LocalDate.of(2026, 4, 10);
    private static final LocalTime START = LocalTime.of(10, 0);
    private static final LocalTime END = LocalTime.of(12, 0);

    /** 테스트용 UserEntity 생성 헬퍼 */
    private UserEntity createUser() {
        return UserEntity.builder()
                .loginId("testuser")
                .passwordHash("hash")
                .name("테스트유저")
                .birthDate("000101")
                .gender(Gender.MALE)
                .nationality("Korean")
                .phone("010-0000-0000")
                .email("test@coliving.com")
                .role(UserRole.RESIDENT)
                .status(UserStatus.ACTIVE)
                .build();
    }

    /** 테스트용 관리자 UserEntity 생성 헬퍼 */
    private UserEntity createAdmin() {
        return UserEntity.builder()
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
                .build();
    }

    /** 테스트용 SpaceEntity 생성 헬퍼 */
    private SpaceEntity createSpace() {
        return SpaceEntity.builder()
                .name("공용 라운지")
                .type(SpaceType.COMMON)
                .status(SpaceStatus.AVAILABLE)
                .floor(1)
                .build();
    }

    private ReservationEntity createReservation() {
        return ReservationEntity.builder()
                .user(createUser())
                .space(createSpace())
                .reservationDate(DATE)
                .startTime(START)
                .endTime(END)
                .build();
    }

    @Nested
    @DisplayName("Builder 생성 테스트")
    class BuilderTest {

        @Test
        @DisplayName("예약 생성 시 PENDING 상태, user/space 매핑, approvedBy null")
        void shouldCreateWithPendingStatus() {
            ReservationEntity reservation = createReservation();

            assertAll(
                    () -> assertEquals(ReservationStatus.PENDING, reservation.getStatus()),
                    () -> assertNotNull(reservation.getUser()),
                    () -> assertNotNull(reservation.getSpace()),
                    () -> assertEquals(DATE, reservation.getReservationDate()),
                    () -> assertEquals(START, reservation.getStartTime()),
                    () -> assertEquals(END, reservation.getEndTime()),
                    () -> assertNull(reservation.getApprovedById())
            );
        }
    }

    @Nested
    @DisplayName("승인(approve) 테스트")
    class ApproveTest {

        @Test
        @DisplayName("PENDING → APPROVED 전환 성공, approvedBy 설정")
        void shouldApproveFromPending() {
            ReservationEntity reservation = createReservation();
            UserEntity admin = createAdmin();
            reservation.approve(admin);

            assertAll(
                    () -> assertEquals(ReservationStatus.APPROVED, reservation.getStatus()),
                    () -> assertEquals(admin, reservation.getApprovedBy())
            );
        }

        @Test
        @DisplayName("APPROVED 상태에서 승인 시 예외 발생")
        void shouldThrowWhenApproveFromApproved() {
            ReservationEntity reservation = createReservation();
            UserEntity admin = createAdmin();
            reservation.approve(admin);

            assertThrows(IllegalStateException.class, () -> reservation.approve(admin));
        }

        @Test
        @DisplayName("CANCELLED 상태에서 승인 시 예외 발생")
        void shouldThrowWhenApproveFromCancelled() {
            ReservationEntity reservation = createReservation();
            reservation.cancel();

            UserEntity admin = createAdmin();
            assertThrows(IllegalStateException.class, () -> reservation.approve(admin));
        }

        @Test
        @DisplayName("COMPLETED 상태에서 승인 시 예외 발생")
        void shouldThrowWhenApproveFromCompleted() {
            ReservationEntity reservation = createReservation();
            UserEntity admin = createAdmin();
            reservation.approve(admin);
            reservation.complete();

            assertThrows(IllegalStateException.class, () -> reservation.approve(admin));
        }
    }

    @Nested
    @DisplayName("취소(cancel) 테스트")
    class CancelTest {

        @Test
        @DisplayName("PENDING → CANCELLED 전환 성공")
        void shouldCancelFromPending() {
            ReservationEntity reservation = createReservation();
            reservation.cancel();

            assertEquals(ReservationStatus.CANCELLED, reservation.getStatus());
        }

        @Test
        @DisplayName("APPROVED → CANCELLED 전환 성공")
        void shouldCancelFromApproved() {
            ReservationEntity reservation = createReservation();
            UserEntity admin = createAdmin();
            reservation.approve(admin);
            reservation.cancel();

            assertEquals(ReservationStatus.CANCELLED, reservation.getStatus());
        }

        @Test
        @DisplayName("COMPLETED 상태에서 취소 시 예외 발생")
        void shouldThrowWhenCancelFromCompleted() {
            ReservationEntity reservation = createReservation();
            UserEntity admin = createAdmin();
            reservation.approve(admin);
            reservation.complete();

            assertThrows(IllegalStateException.class, reservation::cancel);
        }

        @Test
        @DisplayName("CANCELLED 상태에서 취소 시 예외 발생")
        void shouldThrowWhenCancelFromCancelled() {
            ReservationEntity reservation = createReservation();
            reservation.cancel();

            assertThrows(IllegalStateException.class, reservation::cancel);
        }
    }

    @Nested
    @DisplayName("완료(complete) 테스트")
    class CompleteTest {

        @Test
        @DisplayName("APPROVED → COMPLETED 전환 성공")
        void shouldCompleteFromApproved() {
            ReservationEntity reservation = createReservation();
            UserEntity admin = createAdmin();
            reservation.approve(admin);
            reservation.complete();

            assertEquals(ReservationStatus.COMPLETED, reservation.getStatus());
        }

        @Test
        @DisplayName("PENDING 상태에서 완료 시 예외 발생")
        void shouldThrowWhenCompleteFromPending() {
            ReservationEntity reservation = createReservation();

            assertThrows(IllegalStateException.class, reservation::complete);
        }

        @Test
        @DisplayName("CANCELLED 상태에서 완료 시 예외 발생")
        void shouldThrowWhenCompleteFromCancelled() {
            ReservationEntity reservation = createReservation();
            reservation.cancel();

            assertThrows(IllegalStateException.class, reservation::complete);
        }
    }
}
