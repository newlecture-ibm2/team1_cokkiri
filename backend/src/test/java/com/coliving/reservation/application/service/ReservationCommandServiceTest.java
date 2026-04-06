package com.coliving.reservation.application.service;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.model.Gender;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;

import com.coliving.reservation.adapter.in.web.dto.ReservationCreateRequest;
import com.coliving.reservation.adapter.out.jpa.ReservationEntity;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.exception.ReservationOverlapException;
import com.coliving.reservation.model.ReservationStatus;
import com.coliving.user.room.adapter.out.jpa.SpaceEntity;
import com.coliving.user.room.adapter.out.jpa.SpaceJpaRepository;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
class ReservationCommandServiceTest {

    @InjectMocks
    private ReservationCommandService reservationCommandService;

    @Mock
    private ReservationJpaRepository reservationJpaRepository;

    @Mock
    private UserJpaRepository userRepository;

    @Mock
    private SpaceJpaRepository spaceRepository;

    /** 테스트용 UserEntity 생성 */
    private UserEntity mockUser(Long id) {
        UserEntity user = UserEntity.builder()
                .loginId("user" + id)
                .passwordHash("hash")
                .name("유저" + id)
                .birthDate("000101")
                .gender(Gender.MALE)
                .nationality("Korean")
                .phone("010-0000-000" + id)
                .email("user" + id + "@coliving.com")
                .role(UserRole.RESIDENT)
                .status(UserStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(user, "userId", id);
        return user;
    }

    /** 테스트용 관리자 UserEntity 생성 */
    private UserEntity mockAdmin(Long id) {
        UserEntity admin = UserEntity.builder()
                .loginId("admin" + id)
                .passwordHash("hash")
                .name("관리자" + id)
                .birthDate("000101")
                .gender(Gender.MALE)
                .nationality("Korean")
                .phone("010-9999-" + String.format("%04d", id))
                .email("admin" + id + "@coliving.com")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(admin, "userId", id);
        return admin;
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

    private ReservationCreateRequest createMockRequest(LocalTime startTime, LocalTime endTime) {
        ReservationCreateRequest request = new ReservationCreateRequest();
        request.setSpaceId(1L);
        request.setReservationDate(LocalDate.of(2026, 5, 1));
        request.setStartTime(startTime);
        request.setEndTime(endTime);
        return request;
    }

    @Test
    @DisplayName("정상적인 시간 범위와 중복이 없을 경우 예약을 성공하고 ID를 반환한다.")
    void reserveFacility_Success() {
        // given
        Long userId = 100L;
        UserEntity user = mockUser(userId);
        SpaceEntity space = mockSpace(1L);
        ReservationCreateRequest request = createMockRequest(LocalTime.of(14, 0), LocalTime.of(16, 0));

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(spaceRepository.findById(request.getSpaceId())).willReturn(Optional.of(space));
        given(reservationJpaRepository.existsOverlappingReservation(
                request.getSpaceId(), request.getReservationDate(), request.getStartTime(), request.getEndTime()
        )).willReturn(false);

        given(reservationJpaRepository.save(any(ReservationEntity.class))).willAnswer(invocation -> {
            ReservationEntity entity = invocation.getArgument(0);
            ReflectionTestUtils.setField(entity, "id", 999L);
            return entity;
        });

        // when
        Long newId = reservationCommandService.reserveFacility(userId, request);

        // then
        assertThat(newId).isEqualTo(999L);
        verify(reservationJpaRepository).save(any(ReservationEntity.class));
    }

    @Test
    @DisplayName("선택한 시간에 이미 승인된 다른 예약이 있다면 예약 신청을 거절(Exception)한다.")
    void reserveFacility_OverlapException() {
        // given
        Long userId = 100L;
        UserEntity user = mockUser(userId);
        SpaceEntity space = mockSpace(1L);
        ReservationCreateRequest request = createMockRequest(LocalTime.of(14, 0), LocalTime.of(16, 0));

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(spaceRepository.findById(request.getSpaceId())).willReturn(Optional.of(space));
        given(reservationJpaRepository.existsOverlappingReservation(
                request.getSpaceId(), request.getReservationDate(), request.getStartTime(), request.getEndTime()
        )).willReturn(true);

        // when & then
        assertThatThrownBy(() -> reservationCommandService.reserveFacility(userId, request))
                .isInstanceOf(ReservationOverlapException.class)
                .hasMessageContaining("이미 다른 확정된 예약이 존재합니다");
    }

    @Test
    @DisplayName("시작 시간이 종료 시간보다 같거나 늦으면 예외를 발생시킨다.")
    void reserveFacility_InvalidTimeRange() {
        // given
        Long userId = 100L;
        // 16시 시작, 14시 종료 (잘못된 범위)
        ReservationCreateRequest request = createMockRequest(LocalTime.of(16, 0), LocalTime.of(14, 0));

        // when & then
        assertThatThrownBy(() -> reservationCommandService.reserveFacility(userId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("종료 시간은 시작 시간보다 이후여야 합니다");
    }

    @Test
    @DisplayName("관리자가 예약을 정상적으로 승인한다.")
    void approveReservation_Success() {
        // given
        Long reservationId = 100L;
        Long adminId = 999L;
        UserEntity admin = mockAdmin(adminId);

        ReservationEntity pending = ReservationEntity.builder()
                .user(mockUser(1L))
                .space(mockSpace(10L))
                .reservationDate(LocalDate.of(2026, 5, 1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 0))
                .build();
        ReflectionTestUtils.setField(pending, "status", ReservationStatus.PENDING);

        given(reservationJpaRepository.findById(reservationId)).willReturn(Optional.of(pending));
        given(userRepository.findById(adminId)).willReturn(Optional.of(admin));
        given(reservationJpaRepository.save(any(ReservationEntity.class))).willReturn(pending);

        // when
        reservationCommandService.approveReservation(adminId, reservationId);

        // then
        assertThat(pending.getStatus()).isEqualTo(ReservationStatus.APPROVED);
        assertThat(pending.getApprovedById()).isEqualTo(adminId);
    }

    @Test
    @DisplayName("관리자가 예약을 반려(취소)한다.")
    void rejectReservation_Success() {
        // given
        Long reservationId = 100L;
        Long adminId = 999L;

        ReservationEntity pending = ReservationEntity.builder()
                .user(mockUser(1L))
                .space(mockSpace(10L))
                .reservationDate(LocalDate.of(2026, 5, 1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 0))
                .build();
        ReflectionTestUtils.setField(pending, "status", ReservationStatus.PENDING);

        given(reservationJpaRepository.findById(reservationId)).willReturn(Optional.of(pending));

        // when
        reservationCommandService.rejectReservation(adminId, reservationId);

        // then
        assertThat(pending.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
    }
}
