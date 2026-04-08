package com.coliving.reservation.adapter.out.persistence;

import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.application.port.out.ReservationSlotQueryPort;
import com.coliving.reservation.application.result.FacilityReservationSlotResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationSlotQueryPersistenceAdapter implements ReservationSlotQueryPort {

    private final ReservationJpaRepository reservationJpaRepository;

    @Override
    public List<FacilityReservationSlotResult> findFacilityReservationSlots(
            Long spaceId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return reservationJpaRepository.findBySpaceIdAndDateRange(spaceId, startDate, endDate)
                .stream()
                .map(entity -> new FacilityReservationSlotResult(
                        entity.getId(),
                        entity.getUserId(),
                        entity.getReservationDate(),
                        entity.getStartTime(),
                        entity.getEndTime(),
                        entity.getStatus()
                ))
                .toList();
    }
}
