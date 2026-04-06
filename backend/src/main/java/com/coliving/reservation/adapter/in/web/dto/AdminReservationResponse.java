package com.coliving.reservation.adapter.in.web.dto;

import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.model.ReservationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 관리자용 예약 목록 응답 DTO
 */
@Getter
@Builder
@Schema(description = "관리자용 예약 상세 응답 데이터")
public class AdminReservationResponse {

    @Schema(description = "예약 ID", example = "1")
    private Long id;

    @Schema(description = "예약 신청자 사용자 ID", example = "100")
    private Long userId;

    @Schema(description = "공용시설 ID", example = "10")
    private Long spaceId;

    @Schema(description = "예약 상태", example = "PENDING")
    private ReservationStatus status;

    @Schema(description = "예약 날짜", example = "2026-05-01")
    private LocalDate reservationDate;

    @Schema(description = "시작 시간", example = "14:00:00")
    private LocalTime startTime;

    @Schema(description = "종료 시간", example = "16:00:00")
    private LocalTime endTime;

    @Schema(description = "승인자 ID (승인 시)", example = "2")
    private Long approvedBy;

    public static AdminReservationResponse fromEntity(ReservationEntity entity) {
        return AdminReservationResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .spaceId(entity.getSpaceId())
                .status(entity.getStatus())
                .reservationDate(entity.getReservationDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .approvedBy(entity.getApprovedById())
                .build();
    }
}
