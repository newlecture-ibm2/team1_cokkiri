package com.coliving.reservation.application.result;

public record FacilityTimeSlotResult(
        String startTime,
        String endTime,
        String status,
        Long reservationId
) {
}
