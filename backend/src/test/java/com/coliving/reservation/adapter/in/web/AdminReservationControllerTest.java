package com.coliving.reservation.adapter.in.web;

import com.coliving.reservation.adapter.in.web.dto.AdminReservationResponse;
import com.coliving.reservation.application.port.in.ReservationCommandUseCase;
import com.coliving.reservation.application.port.in.ReservationQueryUseCase;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminReservationController.class)
class AdminReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationQueryUseCase reservationQueryUseCase;

    @MockBean
    private ReservationCommandUseCase reservationCommandUseCase;

    @Test
    @WithMockUser
    @DisplayName("관리자가 모든 예약 내역을 조회할 수 있다")
    void getAllReservations_Success() throws Exception {
        AdminReservationResponse response = AdminReservationResponse.builder()
                .id(1L)
                .userId(100L)
                .spaceId(10L)
                .build();
                
        given(reservationQueryUseCase.getAllReservations()).willReturn(List.of(response));

        mockMvc.perform(get("/api/admin/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1L))
                .andExpect(jsonPath("$.data[0].userId").value(100L));
    }

    @Test
    @WithMockUser
    @DisplayName("새로운 예약을 승인 상태로 변경할 수 있다")
    void approveReservation_Success() throws Exception {
        mockMvc.perform(patch("/api/admin/reservations/1/approve")
                        .with(csrf())
                        .header("X-Admin-Id", 999L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    @DisplayName("예약을 반려 처리할 수 있다")
    void rejectReservation_Success() throws Exception {
        mockMvc.perform(patch("/api/admin/reservations/1/reject")
                        .with(csrf())
                        .header("X-Admin-Id", 999L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
