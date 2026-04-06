package com.coliving.reservation.adapter.in.web.dto.res;

import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.model.ReservationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 입주자 예약 목록 응답 DTO
 *
 * GET /api/reservations/my
 * 03-backend-architecture §1-7: 응답 DTO는 ResponseDto 접미사 + res/ 폴더
 */
@Getter
@Builder
@Schema(description = "사용자의 예약 상세 응답 데이터")
public class UserReservationResponseDto {

    @Schema(description = "예약 ID", example = "1")
    private Long id;

    @Schema(description = "공용시설 ID", example = "10")
    private Long spaceId;

    @Schema(description = "공용시설 이름", example = "회의실 A")
    private String spaceName;

    @Schema(description = "예약 상태", example = "APPROVED")
    private ReservationStatus status;

    @Schema(description = "예약 날짜", example = "2026-05-01")
    private LocalDate reservationDate;

    @Schema(description = "시작 시간", example = "14:00:00")
    private LocalTime startTime;

    @Schema(description = "종료 시간", example = "16:00:00")
    private LocalTime endTime;

    public static UserReservationResponseDto fromEntity(ReservationEntity entity) {
        return UserReservationResponseDto.builder()
                .id(entity.getId())
                .spaceId(entity.getSpaceId())
                .spaceName(entity.getSpaceName())
                .status(entity.getStatus())
                .reservationDate(entity.getReservationDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .build();
    }
}
