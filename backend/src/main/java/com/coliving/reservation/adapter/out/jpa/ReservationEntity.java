package com.coliving.reservation.adapter.out.jpa;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.global.entity.BaseEntity;
import com.coliving.reservation.model.ReservationStatus;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 시설 예약 JPA 엔티티
 *
 * 공용 시설(COMMON)에 대한 입주자(RESIDENT)의 예약 정보를 관리한다.
 * schema.sql의 reservation 테이블에 매핑된다.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ 관계 전환 현황 (SPC-2.1 머지 완료)                                 │
 * │                                                                  │
 * │ ✅ user       → @ManyToOne UserEntity (USR-1.1 머지 완료)         │
 * │ ✅ space      → @ManyToOne SpaceEntity (SPC-2.1 머지 완료)        │
 * │ ✅ approvedBy → @ManyToOne UserEntity (nullable, 관리자 참조)      │
 * └──────────────────────────────────────────────────────────────────┘
 */
@Entity
@Table(name = "reservations")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReservationEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long id;

    // USR-1.1 머지 완료 → @ManyToOne 전환
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // SPC-2.1 머지 완료 → @ManyToOne 전환
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private SpaceEntity space;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private ReservationStatus status;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // 승인자 (관리자) 참조 — nullable (PENDING 상태에서는 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private UserEntity approvedBy;

    @Builder
    public ReservationEntity(UserEntity user, SpaceEntity space, LocalDate reservationDate,
                             LocalTime startTime, LocalTime endTime) {
        this.user = user;
        this.space = space;
        this.reservationDate = reservationDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = ReservationStatus.PENDING;
    }

    /** 예약자 ID 편의 getter */
    public Long getUserId() {
        return this.user != null ? this.user.getUserId() : null;
    }

    /** 예약자 이름 편의 getter */
    public String getUserName() {
        return this.user != null ? this.user.getName() : null;
    }

    /** 시설 ID 편의 getter */
    public Long getSpaceId() {
        return this.space != null ? this.space.getSpaceId() : null;
    }

    /** 시설 이름 편의 getter */
    public String getSpaceName() {
        return this.space != null ? this.space.getName() : null;
    }

    /** 승인자 ID 편의 getter */
    public Long getApprovedById() {
        return this.approvedBy != null ? this.approvedBy.getUserId() : null;
    }

    // ── 상태 전환 비즈니스 메서드 ──

    /**
     * 예약 승인 처리
     * PENDING → APPROVED 전환 및 승인자 ID 기록
     *
     * @param adminId 승인한 관리자 ID
     * @throws IllegalStateException PENDING 상태가 아닌 경우
     */
    public void approve(UserEntity admin) {
        validateStatus(ReservationStatus.PENDING, "승인");
        this.status = ReservationStatus.APPROVED;
        this.approvedBy = admin;
    }

    /**
     * 예약 취소 처리
     * PENDING 또는 APPROVED 상태에서만 취소 가능
     *
     * @throws IllegalStateException 취소 불가 상태(COMPLETED, CANCELLED)인 경우
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
     * APPROVED → COMPLETED 전환
     *
     * @throws IllegalStateException APPROVED 상태가 아닌 경우
     */
    public void complete() {
        validateStatus(ReservationStatus.APPROVED, "완료");
        this.status = ReservationStatus.COMPLETED;
    }

    /**
     * 상태 검증 헬퍼 메서드
     * 현재 상태가 기대 상태와 다르면 IllegalStateException 발생
     */
    private void validateStatus(ReservationStatus expected, String action) {
        if (this.status != expected) {
            throw new IllegalStateException(
                    "현재 상태(" + this.status + ")에서는 " + action + " 처리를 할 수 없습니다. "
                    + expected + " 상태여야 합니다.");
        }
    }
}
