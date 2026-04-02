package com.coliving.infra.persistence.entity;

import com.coliving.global.entity.BaseEntity;
import com.coliving.global.entity.ReservationStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 시설 예약 엔티티
 * - 공용 시설(COMMON)에 대한 입주자(RESIDENT)의 예약 정보를 관리한다.
 * - schema.sql의 reservation 테이블에 매핑된다.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ [TODO - 머지 시 수정 필요]                                        │
 * │                                                                  │
 * │ 현재 user_id, space_id, approved_by 필드가 Long 타입으로          │
 * │ 선언되어 있습니다. User/Space 엔티티가 완성되면 아래와 같이          │
 * │ @ManyToOne 관계로 변경해야 합니다:                                 │
 * │                                                                  │
 * │ [변경 전]                                                         │
 * │   @Column(name = "user_id", nullable = false)                    │
 * │   private Long userId;                                           │
 * │                                                                  │
 * │ [변경 후]                                                         │
 * │   @ManyToOne(fetch = FetchType.LAZY)                             │
 * │   @JoinColumn(name = "user_id", nullable = false)                │
 * │   private User user;                                             │
 * │                                                                  │
 * │ space_id → Space, approved_by → User 도 동일하게 변경             │
 * │                                                                  │
 * │ 관련 담당: User(팀원1 USR-1.1), Space(팀원2 SPC-2.1)              │
 * └──────────────────────────────────────────────────────────────────┘
 */
@Entity
@Table(name = "reservation")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long id;

    // TODO: User 엔티티 완성 후 @ManyToOne(fetch = LAZY) + @JoinColumn 으로 변경
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // TODO: Space 엔티티 완성 후 @ManyToOne(fetch = LAZY) + @JoinColumn 으로 변경
    @Column(name = "space_id", nullable = false)
    private Long spaceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private ReservationStatus status;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // TODO: User 엔티티 완성 후 @ManyToOne(fetch = LAZY) + @JoinColumn 으로 변경
    @Column(name = "approved_by")
    private Long approvedBy;

    @Builder
    public Reservation(Long userId, Long spaceId, LocalDate reservationDate,
                       LocalTime startTime, LocalTime endTime) {
        this.userId = userId;
        this.spaceId = spaceId;
        this.reservationDate = reservationDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = ReservationStatus.PENDING;
    }

    // ── 상태 전환 비즈니스 메서드 ──

    /**
     * 예약 승인 처리
     * @param adminId 승인한 관리자 ID
     * @throws IllegalStateException PENDING 상태가 아닌 경우
     */
    public void approve(Long adminId) {
        validateStatus(ReservationStatus.PENDING, "승인");
        this.status = ReservationStatus.APPROVED;
        this.approvedBy = adminId;
    }

    /**
     * 예약 취소 처리
     * - PENDING 또는 APPROVED 상태에서만 취소 가능
     * @throws IllegalStateException 취소 불가 상태인 경우
     */
    public void cancel() {
        if (this.status == ReservationStatus.COMPLETED || this.status == ReservationStatus.CANCELLED) {
            throw new IllegalStateException(
                    "현재 상태(" + this.status + ")에서는 취소할 수 없습니다.");
        }
        this.status = ReservationStatus.CANCELLED;
    }

    /**
     * 예약 이용 완료 처리
     * @throws IllegalStateException APPROVED 상태가 아닌 경우
     */
    public void complete() {
        validateStatus(ReservationStatus.APPROVED, "완료");
        this.status = ReservationStatus.COMPLETED;
    }

    // 상태 검증 헬퍼 메서드
    private void validateStatus(ReservationStatus expected, String action) {
        if (this.status != expected) {
            throw new IllegalStateException(
                    "현재 상태(" + this.status + ")에서는 " + action + " 처리를 할 수 없습니다. "
                    + expected + " 상태여야 합니다.");
        }
    }
}
