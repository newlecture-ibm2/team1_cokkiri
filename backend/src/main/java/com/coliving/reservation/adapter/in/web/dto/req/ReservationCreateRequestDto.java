package com.coliving.reservation.adapter.in.web.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

/**
 * 예약 신청 요청 DTO
 *
 * POST /api/reservations
 * 03-backend-architecture §1-7: 요청 DTO는 RequestDto 접미사 + req/ 폴더
 */
@Getter
@Setter
@NoArgsConstructor
@Schema(description = "예약 생성 요청 데이터")
public class ReservationCreateRequestDto {

    @NotNull(message = "예약할 시설 ID는 필수입니다.")
    @Schema(description = "공용시설 ID", example = "1")
    private Long spaceId;

    @NotNull(message = "예약 날짜는 필수입니다.")
    @FutureOrPresent(message = "예약 날짜는 오늘 이후여야 합니다.")
    @Schema(description = "예약 날짜", example = "2026-05-01")
    private LocalDate reservationDate;

    @NotNull(message = "시작 시간은 필수입니다.")
    @Schema(description = "시작 시간", type = "string", format = "time", example = "14:00:00")
    private LocalTime startTime;

    @NotNull(message = "종료 시간은 필수입니다.")
    @Schema(description = "종료 시간", type = "string", format = "time", example = "16:00:00")
    private LocalTime endTime;

    /** 종료 시간이 시작 시간보다 늦어야 함 */
    public boolean isValidTimeRange() {
        if (startTime == null || endTime == null) return false;
        return endTime.isAfter(startTime);
    }

    public boolean isWithinMaxUsageMinutes(long maxMinutes) {
        if (startTime == null || endTime == null) return false;
        long durationMinutes = ChronoUnit.MINUTES.between(startTime, endTime);
        return durationMinutes > 0 && durationMinutes <= maxMinutes;
    }
}
