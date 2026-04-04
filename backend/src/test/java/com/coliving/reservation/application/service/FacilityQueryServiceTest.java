package com.coliving.reservation.application.service;

import com.coliving.global.error.BusinessException;
import com.coliving.reservation.adapter.out.dto.FacilityDetailResponse;
import com.coliving.reservation.adapter.out.dto.ReservableFacilityResponse;
import com.coliving.reservation.application.port.out.FacilityQueryPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * FacilityQueryService 단위 테스트
 *
 * Mockito로 FacilityQueryPort를 모킹하여 서비스 로직만 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class FacilityQueryServiceTest {

    @Mock
    private FacilityQueryPort facilityQueryPort;

    @InjectMocks
    private FacilityQueryService facilityQueryService;

    @Nested
    @DisplayName("getReservableFacilities 테스트")
    class GetReservableFacilitiesTest {

        @Test
        @DisplayName("예약 가능한 시설 목록 정상 반환")
        void shouldReturnFacilities() {
            // given
            List<ReservableFacilityResponse> mockFacilities = List.of(
                    ReservableFacilityResponse.builder()
                            .spaceId(1L)
                            .name("공유 주방")
                            .status("AVAILABLE")
                            .maxCapacity(10)
                            .operatingHours("09:00-22:00")
                            .usageFee(BigDecimal.ZERO)
                            .build(),
                    ReservableFacilityResponse.builder()
                            .spaceId(2L)
                            .name("헬스장")
                            .status("AVAILABLE")
                            .maxCapacity(20)
                            .operatingHours("06:00-23:00")
                            .usageFee(BigDecimal.valueOf(5000))
                            .build()
            );
            when(facilityQueryPort.findAllReservableFacilities()).thenReturn(mockFacilities);

            // when
            List<ReservableFacilityResponse> result = facilityQueryService.getReservableFacilities();

            // then
            assertEquals(2, result.size());
            assertEquals("공유 주방", result.get(0).getName());
            verify(facilityQueryPort, times(1)).findAllReservableFacilities();
        }

        @Test
        @DisplayName("예약 가능한 시설이 없으면 빈 목록 반환")
        void shouldReturnEmptyList() {
            when(facilityQueryPort.findAllReservableFacilities()).thenReturn(Collections.emptyList());

            List<ReservableFacilityResponse> result = facilityQueryService.getReservableFacilities();

            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("getFacilityDetail 테스트")
    class GetFacilityDetailTest {

        @Test
        @DisplayName("시설 상세 정보 정상 반환")
        void shouldReturnDetail() {
            // given
            FacilityDetailResponse mockDetail = FacilityDetailResponse.builder()
                    .spaceId(1L)
                    .name("공유 주방")
                    .status("AVAILABLE")
                    .floor(1)
                    .maxCapacity(10)
                    .operatingHours("09:00-22:00")
                    .usageFee(BigDecimal.ZERO)
                    .isReservable(true)
                    .todayReservationCount(3)
                    .build();
            when(facilityQueryPort.findFacilityDetail(1L)).thenReturn(mockDetail);

            // when
            FacilityDetailResponse result = facilityQueryService.getFacilityDetail(1L);

            // then
            assertAll(
                    () -> assertEquals(1L, result.getSpaceId()),
                    () -> assertEquals("공유 주방", result.getName()),
                    () -> assertEquals(3, result.getTodayReservationCount())
            );
        }

        @Test
        @DisplayName("시설이 존재하지 않으면 BusinessException (NOT_FOUND) 발생")
        void shouldThrowWhenNotFound() {
            when(facilityQueryPort.findFacilityDetail(999L)).thenReturn(null);

            assertThrows(BusinessException.class,
                    () -> facilityQueryService.getFacilityDetail(999L));
        }
    }
}
