package com.coliving.reservation.application.service;

import com.coliving.reservation.adapter.out.dto.FacilityDetailResponse;
import com.coliving.reservation.adapter.out.dto.ReservableFacilityResponse;
import com.coliving.reservation.application.port.in.FacilityQueryUseCase;
import com.coliving.reservation.application.port.out.FacilityQueryPort;
import com.coliving.reservation.application.port.out.ReservationSlotQueryPort;
import com.coliving.reservation.application.result.FacilityReservationSlotResult;
import com.coliving.reservation.application.result.FacilityTimeSlotResult;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.reservation.model.ReservationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 예약 시설 조회 서비스
 *
 * RES-RSV-01: 예약 가능한 공용시설 목록/상세 조회 비즈니스 로직을 담당한다.
 *
 * 읽기 전용 트랜잭션을 사용하여 DB 부하를 최소화한다.
 * 추후 캐싱 적용 시 @Cacheable 어노테이션 추가를 고려할 수 있다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 조회 전용 서비스이므로 readOnly 최적화
public class FacilityQueryService implements FacilityQueryUseCase {

    private final FacilityQueryPort facilityQueryPort;
    private final ReservationSlotQueryPort reservationSlotQueryPort;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    /**
     * 예약 가능한 공용시설 전체 목록을 조회한다.
     *
     * - 공용 시설(COMMON) 중 is_reservable = true인 시설만 반환
     * - 점검 중(MAINTENANCE) 시설은 제외
     * - 이름순 정렬
     *
     * @return 예약 가능한 공용시설 목록
     */
    @Override
    public List<ReservableFacilityResponse> getReservableFacilities() {
        log.info("[RES-RSV-01] 예약 가능한 공용시설 목록 조회 요청");

        List<ReservableFacilityResponse> facilities = facilityQueryPort.findAllReservableFacilities();

        log.info("[RES-RSV-01] 조회된 예약 가능 시설 수: {}", facilities.size());
        return facilities;
    }

    /**
     * 특정 공용시설의 상세 정보를 조회한다.
     *
     * - 해당 시설이 존재하지 않거나 공용 시설이 아니면 NOT_FOUND 예외 발생
     * - 오늘 날짜 기준 예약 건수를 함께 반환
     *
     * @param spaceId 시설 ID
     * @return 시설 상세 정보
     * @throws BusinessException 시설을 찾을 수 없는 경우 (NOT_FOUND)
     */
    @Override
    public FacilityDetailResponse getFacilityDetail(Long spaceId) {
        log.info("[RES-RSV-01] 공용시설 상세 조회 요청 - spaceId: {}", spaceId);

        FacilityDetailResponse detail = facilityQueryPort.findFacilityDetail(spaceId);

        if (detail == null) {
            log.warn("[RES-RSV-01] 시설을 찾을 수 없음 - spaceId: {}", spaceId);
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        return detail;
    }

    @Override
    public Map<String, List<FacilityTimeSlotResult>> getWeeklyTimeSlots(Long userId, Long spaceId, LocalDate weekStart) {
        log.info("[RES-RSV-01] 공용시설 주간 슬롯 조회 요청 - userId: {}, spaceId: {}, weekStart: {}",
                userId, spaceId, weekStart);

        FacilityDetailResponse detail = facilityQueryPort.findFacilityDetail(spaceId);
        if (detail == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        LocalDate normalizedWeekStart = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate normalizedWeekEnd = normalizedWeekStart.plusDays(6);

        List<FacilityReservationSlotResult> reservations = reservationSlotQueryPort.findFacilityReservationSlots(
                spaceId,
                normalizedWeekStart,
                normalizedWeekEnd
        );

        Map<String, Map<String, FacilityTimeSlotResult>> slotIndexByDate = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            slotIndexByDate.put(normalizedWeekStart.plusDays(i).toString(), new LinkedHashMap<>());
        }

        for (FacilityReservationSlotResult reservation : reservations) {
            String slotStatus = resolveSlotStatus(userId, reservation);
            if (slotStatus == null) {
                continue;
            }

            Map<String, FacilityTimeSlotResult> daySlots = slotIndexByDate.get(reservation.reservationDate().toString());
            if (daySlots == null) {
                continue;
            }

            for (LocalTime cursor = reservation.startTime();
                 cursor.isBefore(reservation.endTime());
                 cursor = cursor.plusMinutes(30)) {
                LocalTime slotEnd = cursor.plusMinutes(30);
                if (slotEnd.isAfter(reservation.endTime())) {
                    slotEnd = reservation.endTime();
                }

                FacilityTimeSlotResult candidate = new FacilityTimeSlotResult(
                        cursor.format(TIME_FORMATTER),
                        slotEnd.format(TIME_FORMATTER),
                        slotStatus,
                        reservation.reservationId()
                );

                daySlots.merge(
                        candidate.startTime(),
                        candidate,
                        (existing, incoming) -> hasHigherPriority(incoming.status(), existing.status()) ? incoming : existing
                );
            }
        }

        Map<String, List<FacilityTimeSlotResult>> response = new LinkedHashMap<>();
        slotIndexByDate.forEach((date, slots) -> response.put(date, new ArrayList<>(slots.values())));
        return response;
    }

    private String resolveSlotStatus(Long userId, FacilityReservationSlotResult reservation) {
        if (userId != null && userId.equals(reservation.userId())
                && (reservation.status() == ReservationStatus.PENDING || reservation.status() == ReservationStatus.APPROVED)) {
            return "MY_RESERVATION";
        }

        if (reservation.status() == ReservationStatus.PENDING || reservation.status() == ReservationStatus.APPROVED) {
            return "OCCUPIED";
        }

        return null;
    }

    private boolean hasHigherPriority(String candidateStatus, String currentStatus) {
        return priorityOf(candidateStatus) > priorityOf(currentStatus);
    }

    private int priorityOf(String status) {
        return switch (status) {
            case "MY_RESERVATION" -> 2;
            case "OCCUPIED" -> 1;
            default -> 0;
        };
    }
}
