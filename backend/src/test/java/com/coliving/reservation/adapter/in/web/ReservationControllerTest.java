package com.coliving.reservation.adapter.in.web;

import com.coliving.reservation.adapter.in.web.dto.req.ReservationCreateRequestDto;
import com.coliving.reservation.adapter.in.web.dto.res.UserReservationResponseDto;
import com.coliving.reservation.application.port.in.ReservationCommandUseCase;
import com.coliving.reservation.application.port.in.ReservationQueryUseCase;
import com.coliving.reservation.exception.ReservationOverlapException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ReservationController 슬라이스 테스트
 *
 * #80 예약 동시성 차단 신청 로직
 * #81 예약 조회 및 취소 롤백
 *
 * 검증 항목:
 * - POST /api/reservations              : 정상 예약 / 중복 예약 충돌
 * - GET  /api/reservations/my           : 내 예약 목록 조회
 * - POST /api/reservations/{id}/cancel  : 예약 취소 (PENDING/APPROVED → CANCELLED)
 */
@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReservationCommandUseCase reservationCommandUseCase;

    @MockBean
    private ReservationQueryUseCase reservationQueryUseCase;

    /** 테스트용 예약 요청 DTO 생성 헬퍼 */
    private ReservationCreateRequestDto createRequest(LocalTime startTime, LocalTime endTime) {
        ReservationCreateRequestDto request = new ReservationCreateRequestDto();
        request.setSpaceId(1L);
        request.setReservationDate(LocalDate.of(2026, 5, 1));
        request.setStartTime(startTime);
        request.setEndTime(endTime);
        return request;
    }

    @Test
    @WithMockUser
    @DisplayName("정상적인 예약 요청 시 200 응답과 함께 reservationId를 반환한다")
    void createReservation_Success() throws Exception {
        ReservationCreateRequestDto request = createRequest(LocalTime.of(14, 0), LocalTime.of(16, 0));

        given(reservationCommandUseCase.reserveFacility(eq(1L), any(ReservationCreateRequestDto.class)))
                .willReturn(999L);

        mockMvc.perform(post("/api/reservations")
                        .with(csrf())
                        .header("X-User-Id", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reservationId").value(999L));
    }

    @Test
    @WithMockUser
    @DisplayName("중복 예약 발생 시 409 Conflict 에러 응답을 반환한다")
    void createReservation_Conflict() throws Exception {
        ReservationCreateRequestDto request = createRequest(LocalTime.of(14, 0), LocalTime.of(16, 0));

        given(reservationCommandUseCase.reserveFacility(eq(1L), any(ReservationCreateRequestDto.class)))
                .willThrow(new ReservationOverlapException("선택한 시간에 이미 다른 확정된 예약이 존재합니다."));

        mockMvc.perform(post("/api/reservations")
                        .with(csrf())
                        .header("X-User-Id", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("TIME_SLOT_CONFLICT"));
    }

    @Test
    @WithMockUser
    @DisplayName("본인의 예약 내역을 GET /api/reservations/my 로 조회할 수 있다")
    void getMyReservations_Success() throws Exception {
        UserReservationResponseDto response = UserReservationResponseDto.builder()
                .id(999L)
                .spaceId(1L)
                .spaceName("회의실 A")
                .build();

        given(reservationQueryUseCase.getUserReservations(1L))
                .willReturn(List.of(response));

        // #81: GET /reservations/my (api-specification.md §6.4)
        mockMvc.perform(get("/api/reservations/my")
                        .header("X-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(999L))
                .andExpect(jsonPath("$.data[0].spaceName").value("회의실 A"));
    }

    @Test
    @WithMockUser
    @DisplayName("예약 취소 API POST /api/reservations/{id}/cancel 호출 시 200을 반환한다")
    void cancelReservation_Success() throws Exception {
        // #81: POST /reservations/{id}/cancel (api-specification.md §6.5)
        mockMvc.perform(post("/api/reservations/999/cancel")
                        .with(csrf())
                        .header("X-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
