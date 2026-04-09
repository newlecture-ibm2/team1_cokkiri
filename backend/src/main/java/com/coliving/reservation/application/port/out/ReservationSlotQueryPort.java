package com.coliving.reservation.application.port.out;

import com.coliving.reservation.application.result.FacilityReservationSlotResult;

import java.time.LocalDate;
import java.util.List;

public interface ReservationSlotQueryPort {

    List<FacilityReservationSlotResult> findFacilityReservationSlots(
            Long spaceId,
            LocalDate startDate,
            LocalDate endDate
    );
}
