package com.coliving.reservation.adapter.in.web;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.reservation.adapter.out.dto.FacilityDetailResponse;
import com.coliving.reservation.adapter.out.dto.ReservableFacilityResponse;
import com.coliving.reservation.application.service.FacilityQueryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * FacilityController 슬라이스 테스트
 *
 * @WebMvcTest로 Controller 계층만 로드하여 HTTP 요청/응답을 검증한다.
 * Security 필터는 비활성화(addFilters = false)하여 인증 없이 테스트한다.
 */
@WebMvcTest(FacilityController.class)
@AutoConfigureMockMvc(addFilters = false) // Security 필터 비활성화
class FacilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FacilityQueryService facilityQueryService;

    @Nested
    @DisplayName("GET /api/facilities")
    class GetFacilitiesTest {

        @Test
        @DisplayName("200 OK - 예약 가능 시설 목록 반환")
        void shouldReturnFacilities() throws Exception {
            // given
            List<ReservableFacilityResponse> facilities = List.of(
                    ReservableFacilityResponse.builder()
                            .spaceId(1L)
                            .name("공유 주방")
                            .status("AVAILABLE")
                            .floor(1)
                            .maxCapacity(10)
                            .operatingHours("09:00-22:00")
                            .usageFee(BigDecimal.ZERO)
                            .images(Collections.emptyList())
                            .build()
            );
            when(facilityQueryService.getReservableFacilities()).thenReturn(facilities);

            // when & then
            mockMvc.perform(get("/api/facilities")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(1))
                    .andExpect(jsonPath("$.data[0].spaceId").value(1))
                    .andExpect(jsonPath("$.data[0].name").value("공유 주방"))
                    .andExpect(jsonPath("$.data[0].maxCapacity").value(10));
        }

        @Test
        @DisplayName("200 OK - 시설이 없으면 빈 배열 반환")
        void shouldReturnEmptyArray() throws Exception {
            when(facilityQueryService.getReservableFacilities()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/facilities")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/facilities/{spaceId}")
    class GetFacilityDetailTest {

        @Test
        @DisplayName("200 OK - 시설 상세 정보 반환")
        void shouldReturnDetail() throws Exception {
            // given
            FacilityDetailResponse detail = FacilityDetailResponse.builder()
                    .spaceId(1L)
                    .name("공유 주방")
                    .status("AVAILABLE")
                    .floor(1)
                    .area(BigDecimal.valueOf(45.5))
                    .maxCapacity(10)
                    .operatingHours("09:00-22:00")
                    .usageFee(BigDecimal.ZERO)
                    .isReservable(true)
                    .todayReservationCount(2)
                    .images(Collections.emptyList())
                    .build();
            when(facilityQueryService.getFacilityDetail(1L)).thenReturn(detail);

            // when & then
            mockMvc.perform(get("/api/facilities/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.spaceId").value(1))
                    .andExpect(jsonPath("$.data.name").value("공유 주방"))
                    .andExpect(jsonPath("$.data.todayReservationCount").value(2));
        }

        @Test
        @DisplayName("404 NOT_FOUND - 시설이 존재하지 않는 경우")
        void shouldReturn404WhenNotFound() throws Exception {
            when(facilityQueryService.getFacilityDetail(999L))
                    .thenThrow(new BusinessException(ErrorCode.NOT_FOUND));

            mockMvc.perform(get("/api/facilities/999")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.errorCode").value("NOT_FOUND"));
        }
    }
}
