package com.coliving.reservation.application.service;

import com.coliving.reservation.adapter.in.web.dto.UserReservationResponse;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.model.ReservationStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ReservationQueryServiceTest {

    @InjectMocks
    private ReservationQueryService reservationQueryService;

    @Mock
    private ReservationJpaRepository reservationRepository;

    @Test
    @DisplayName("사용자 ID로 예약 역순 목록을 조회한다.")
    void getUserReservations_Success() {
        // given
        Long userId = 1L;
        ReservationEntity entity = ReservationEntity.builder()
                .userId(userId)
                .spaceId(10L)
                .reservationDate(LocalDate.of(2026, 5, 1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 0))
                .build();
        
        // Use reflection to set private field 'id' if needed, or rely on null id for test
        org.springframework.test.util.ReflectionTestUtils.setField(entity, "id", 100L);
        org.springframework.test.util.ReflectionTestUtils.setField(entity, "status", ReservationStatus.APPROVED);

        given(reservationRepository.findByUserIdOrderByReservationDateDescStartTimeDesc(userId))
                .willReturn(List.of(entity));

        // when
        List<UserReservationResponse> responses = reservationQueryService.getUserReservations(userId);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getId()).isEqualTo(100L);
        assertThat(responses.get(0).getSpaceId()).isEqualTo(10L);
        assertThat(responses.get(0).getStatus()).isEqualTo(ReservationStatus.APPROVED);
    }
}
