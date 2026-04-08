package com.coliving.reservation.application.result;

import com.coliving.reservation.model.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record FacilityReservationSlotResult(
        Long reservationId,
        Long userId,
        LocalDate reservationDate,
        LocalTime startTime,
        LocalTime endTime,
        ReservationStatus status
) {
}
