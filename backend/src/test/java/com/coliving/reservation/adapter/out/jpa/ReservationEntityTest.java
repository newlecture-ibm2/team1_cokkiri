package com.coliving.reservation.adapter.out.jpa;

import com.coliving.reservation.model.ReservationStatus;
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
 */
class ReservationEntityTest {

    // ── 테스트 데이터 상수 ──
    private static final Long USER_ID = 1L;
    private static final Long SPACE_ID = 10L;
    private static final Long ADMIN_ID = 99L;
    private static final LocalDate DATE = LocalDate.of(2026, 4, 10);
    private static final LocalTime START = LocalTime.of(10, 0);
    private static final LocalTime END = LocalTime.of(12, 0);

    private ReservationEntity createReservation() {
        return ReservationEntity.builder()
                .userId(USER_ID)
                .spaceId(SPACE_ID)
                .reservationDate(DATE)
                .startTime(START)
                .endTime(END)
                .build();
    }

    @Nested
    @DisplayName("Builder 생성 테스트")
    class BuilderTest {

        @Test
        @DisplayName("예약 생성 시 PENDING 상태, userId/spaceId 매핑, approvedBy null")
        void shouldCreateWithPendingStatus() {
            ReservationEntity reservation = createReservation();

            assertAll(
                    () -> assertEquals(ReservationStatus.PENDING, reservation.getStatus()),
                    () -> assertEquals(USER_ID, reservation.getUserId()),
                    () -> assertEquals(SPACE_ID, reservation.getSpaceId()),
                    () -> assertEquals(DATE, reservation.getReservationDate()),
                    () -> assertEquals(START, reservation.getStartTime()),
                    () -> assertEquals(END, reservation.getEndTime()),
                    () -> assertNull(reservation.getApprovedBy())
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
            reservation.approve(ADMIN_ID);

            assertAll(
                    () -> assertEquals(ReservationStatus.APPROVED, reservation.getStatus()),
                    () -> assertEquals(ADMIN_ID, reservation.getApprovedBy())
            );
        }

        @Test
        @DisplayName("APPROVED 상태에서 승인 시 예외 발생")
        void shouldThrowWhenApproveFromApproved() {
            ReservationEntity reservation = createReservation();
            reservation.approve(ADMIN_ID);

            assertThrows(IllegalStateException.class, () -> reservation.approve(ADMIN_ID));
        }

        @Test
        @DisplayName("CANCELLED 상태에서 승인 시 예외 발생")
        void shouldThrowWhenApproveFromCancelled() {
            ReservationEntity reservation = createReservation();
            reservation.cancel();

            assertThrows(IllegalStateException.class, () -> reservation.approve(ADMIN_ID));
        }

        @Test
        @DisplayName("COMPLETED 상태에서 승인 시 예외 발생")
        void shouldThrowWhenApproveFromCompleted() {
            ReservationEntity reservation = createReservation();
            reservation.approve(ADMIN_ID);
            reservation.complete();

            assertThrows(IllegalStateException.class, () -> reservation.approve(ADMIN_ID));
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
            reservation.approve(ADMIN_ID);
            reservation.cancel();

            assertEquals(ReservationStatus.CANCELLED, reservation.getStatus());
        }

        @Test
        @DisplayName("COMPLETED 상태에서 취소 시 예외 발생")
        void shouldThrowWhenCancelFromCompleted() {
            ReservationEntity reservation = createReservation();
            reservation.approve(ADMIN_ID);
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
            reservation.approve(ADMIN_ID);
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
