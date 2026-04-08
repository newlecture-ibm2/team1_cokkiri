package com.coliving.reservation.adapter.in.web.dto.res;

import com.coliving.reservation.application.result.FacilityTimeSlotResult;

public record FacilityTimeSlotResponseDto(
        String startTime,
        String endTime,
        String status,
        Long reservationId
) {
    public static FacilityTimeSlotResponseDto from(FacilityTimeSlotResult result) {
        return new FacilityTimeSlotResponseDto(
                result.startTime(),
                result.endTime(),
                result.status(),
                result.reservationId()
        );
    }
}
