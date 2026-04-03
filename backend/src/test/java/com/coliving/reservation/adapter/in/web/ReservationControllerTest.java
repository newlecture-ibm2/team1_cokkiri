package com.coliving.reservation.adapter.in.web;

import com.coliving.reservation.adapter.in.web.dto.ReservationCreateRequest;
import com.coliving.reservation.application.port.in.ReservationCommandUseCase;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReservationCommandUseCase reservationCommandUseCase;

    private ReservationCreateRequest createRequest(LocalTime startTime, LocalTime endTime) {
        ReservationCreateRequest request = new ReservationCreateRequest();
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
        ReservationCreateRequest request = createRequest(LocalTime.of(14, 0), LocalTime.of(16, 0));
        
        given(reservationCommandUseCase.reserveFacility(eq(1L), any(ReservationCreateRequest.class)))
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
        ReservationCreateRequest request = createRequest(LocalTime.of(14, 0), LocalTime.of(16, 0));
        
        given(reservationCommandUseCase.reserveFacility(eq(1L), any(ReservationCreateRequest.class)))
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
}
