package com.coliving.infra.persistence.entity;

import com.coliving.global.entity.ReservationStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Reservation 엔티티 단위 테스트
 * - DB 없이 순수 Java 로직만 검증한다.
 * - 상태 전환 비즈니스 메서드의 정상/예외 케이스를 테스트한다.
 */
class ReservationTest {

    private Reservation createPendingReservation() {
        return Reservation.builder()
                .userId(1L)
                .spaceId(10L)
                .reservationDate(LocalDate.of(2026, 4, 5))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .build();
    }

    // ── 생성 테스트 ──

    @Test
    @DisplayName("Builder로 예약 생성 시 상태는 PENDING이어야 한다")
    void createReservation_shouldHavePendingStatus() {
        Reservation reservation = createPendingReservation();

        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.PENDING);
        assertThat(reservation.getUserId()).isEqualTo(1L);
        assertThat(reservation.getSpaceId()).isEqualTo(10L);
        assertThat(reservation.getApprovedBy()).isNull();
    }

    // ── approve() 테스트 ──

    @Nested
    @DisplayName("approve() - 예약 승인")
    class Approve {

        @Test
        @DisplayName("PENDING 상태에서 승인하면 APPROVED 상태가 되고, approvedBy에 관리자 ID가 설정된다")
        void approve_fromPending_shouldBeApproved() {
            Reservation reservation = createPendingReservation();

            reservation.approve(100L);

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.APPROVED);
            assertThat(reservation.getApprovedBy()).isEqualTo(100L);
        }

        @Test
        @DisplayName("APPROVED 상태에서 승인하면 IllegalStateException이 발생한다")
        void approve_fromApproved_shouldThrow() {
            Reservation reservation = createPendingReservation();
            reservation.approve(100L);

            assertThatThrownBy(() -> reservation.approve(200L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("승인");
        }

        @Test
        @DisplayName("CANCELLED 상태에서 승인하면 IllegalStateException이 발생한다")
        void approve_fromCancelled_shouldThrow() {
            Reservation reservation = createPendingReservation();
            reservation.cancel();

            assertThatThrownBy(() -> reservation.approve(100L))
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("COMPLETED 상태에서 승인하면 IllegalStateException이 발생한다")
        void approve_fromCompleted_shouldThrow() {
            Reservation reservation = createPendingReservation();
            reservation.approve(100L);
            reservation.complete();

            assertThatThrownBy(() -> reservation.approve(200L))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    // ── cancel() 테스트 ──

    @Nested
    @DisplayName("cancel() - 예약 취소")
    class Cancel {

        @Test
        @DisplayName("PENDING 상태에서 취소하면 CANCELLED 상태가 된다")
        void cancel_fromPending_shouldBeCancelled() {
            Reservation reservation = createPendingReservation();

            reservation.cancel();

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        }

        @Test
        @DisplayName("APPROVED 상태에서 취소하면 CANCELLED 상태가 된다")
        void cancel_fromApproved_shouldBeCancelled() {
            Reservation reservation = createPendingReservation();
            reservation.approve(100L);

            reservation.cancel();

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        }

        @Test
        @DisplayName("COMPLETED 상태에서 취소하면 IllegalStateException이 발생한다")
        void cancel_fromCompleted_shouldThrow() {
            Reservation reservation = createPendingReservation();
            reservation.approve(100L);
            reservation.complete();

            assertThatThrownBy(() -> reservation.cancel())
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("취소");
        }

        @Test
        @DisplayName("CANCELLED 상태에서 다시 취소하면 IllegalStateException이 발생한다")
        void cancel_fromCancelled_shouldThrow() {
            Reservation reservation = createPendingReservation();
            reservation.cancel();

            assertThatThrownBy(() -> reservation.cancel())
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("취소");
        }
    }

    // ── complete() 테스트 ──

    @Nested
    @DisplayName("complete() - 이용 완료")
    class Complete {

        @Test
        @DisplayName("APPROVED 상태에서 완료하면 COMPLETED 상태가 된다")
        void complete_fromApproved_shouldBeCompleted() {
            Reservation reservation = createPendingReservation();
            reservation.approve(100L);

            reservation.complete();

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
        }

        @Test
        @DisplayName("PENDING 상태에서 완료하면 IllegalStateException이 발생한다")
        void complete_fromPending_shouldThrow() {
            Reservation reservation = createPendingReservation();

            assertThatThrownBy(() -> reservation.complete())
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("완료");
        }

        @Test
        @DisplayName("CANCELLED 상태에서 완료하면 IllegalStateException이 발생한다")
        void complete_fromCancelled_shouldThrow() {
            Reservation reservation = createPendingReservation();
            reservation.cancel();

            assertThatThrownBy(() -> reservation.complete())
                    .isInstanceOf(IllegalStateException.class);
        }
    }
}
