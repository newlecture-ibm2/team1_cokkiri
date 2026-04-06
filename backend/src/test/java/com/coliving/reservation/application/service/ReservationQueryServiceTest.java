package com.coliving.reservation.application.service;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.model.Gender;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.reservation.adapter.in.web.dto.res.UserReservationResponseDto;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.model.ReservationStatus;
import com.coliving.user.room.adapter.out.jpa.SpaceEntity;
import com.coliving.user.room.model.SpaceStatus;
import com.coliving.user.room.model.SpaceType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
class ReservationQueryServiceTest {

    @InjectMocks
    private ReservationQueryService reservationQueryService;

    @Mock
    private ReservationJpaRepository reservationRepository;

    /** 테스트용 UserEntity 생성 */
    private UserEntity mockUser(Long id) {
        UserEntity user = UserEntity.builder()
                .loginId("user" + id)
                .passwordHash("hash")
                .name("유저" + id)
                .birthDate("000101")
                .gender(Gender.MALE)
                .nationality("Korean")
                .phone("010-0000-" + String.format("%04d", id))
                .email("user" + id + "@coliving.com")
                .role(UserRole.RESIDENT)
                .status(UserStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(user, "userId", id);
        return user;
    }

    /** 테스트용 SpaceEntity 생성 */
    private SpaceEntity mockSpace(Long id) {
        SpaceEntity space = SpaceEntity.builder()
                .name("회의실 " + id)
                .type(SpaceType.COMMON)
                .status(SpaceStatus.AVAILABLE)
                .floor(1)
                .build();
        ReflectionTestUtils.setField(space, "spaceId", id);
        return space;
    }

    @Test
    @DisplayName("사용자 ID로 예약 역순 목록을 조회한다.")
    void getUserReservations_Success() {
        // given
        Long userId = 1L;
        UserEntity user = mockUser(userId);
        SpaceEntity space = mockSpace(10L);

        ReservationEntity entity = ReservationEntity.builder()
                .user(user)
                .space(space)
                .reservationDate(LocalDate.of(2026, 5, 1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 0))
                .build();

        ReflectionTestUtils.setField(entity, "id", 100L);
        ReflectionTestUtils.setField(entity, "status", ReservationStatus.APPROVED);

        given(reservationRepository.findByUser_UserIdOrderByReservationDateDescStartTimeDesc(userId))
                .willReturn(List.of(entity));

        // when
        List<UserReservationResponseDto> responses = reservationQueryService.getUserReservations(userId);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getId()).isEqualTo(100L);
        assertThat(responses.get(0).getSpaceId()).isEqualTo(10L);
        assertThat(responses.get(0).getStatus()).isEqualTo(ReservationStatus.APPROVED);
    }

    @Test
    @DisplayName("관리자가 모든 예약을 역순으로 조회한다.")
    void getAllReservations_Success() {
        // given
        UserEntity user = mockUser(2L);
        SpaceEntity space = mockSpace(11L);

        ReservationEntity entity = ReservationEntity.builder()
                .user(user)
                .space(space)
                .reservationDate(LocalDate.of(2026, 5, 2))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .build();

        ReflectionTestUtils.setField(entity, "id", 200L);
        ReflectionTestUtils.setField(entity, "status", ReservationStatus.PENDING);

        given(reservationRepository.findAllByOrderByReservationDateDescStartTimeDesc())
                .willReturn(List.of(entity));

        // when
        var responses = reservationQueryService.getAllReservations();

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getId()).isEqualTo(200L);
        assertThat(responses.get(0).getUserId()).isEqualTo(2L);
        assertThat(responses.get(0).getSpaceId()).isEqualTo(11L);
        assertThat(responses.get(0).getStatus()).isEqualTo(ReservationStatus.PENDING);
    }
}
