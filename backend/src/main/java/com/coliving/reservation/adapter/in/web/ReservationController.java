package com.coliving.reservation.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.reservation.adapter.in.web.dto.req.ReservationCreateRequestDto;
import com.coliving.reservation.adapter.in.web.dto.res.UserReservationResponseDto;
import com.coliving.reservation.application.port.in.ReservationCommandUseCase;
import com.coliving.reservation.application.port.in.ReservationQueryUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 입주자 예약 신청/조회/취소 REST Controller
 *
 * #80 예약 동시성 차단 신청 로직
 * #81 예약 조회 및 취소 롤백
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ [TODO - Auth 연동 시 수정 필요]                                   │
 * │ 현재 헤더(X-User-Id)로 사용자 ID를 받고 있으나,                   │
 * │ 추후 Spring Security의 @AuthenticationPrincipal 등으로 인증        │
 * │ 객체에서 userId를 추출하도록 변경해야 합니다.                     │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * api-specification.md §6:
 *   GET  /api/reservations/my          → 내 예약 목록 조회 (🏠)
 *   POST /api/reservations             → 예약 신청 (🏠)
 *   POST /api/reservations/{id}/cancel → 예약 취소 (🏠)
 */
@Tag(name = "Reservation", description = "예약 신청 및 관리 API (#80, #81)")
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationCommandUseCase reservationCommandUseCase;
    private final ReservationQueryUseCase reservationQueryUseCase;

    /**
     * 내 예약 목록 조회
     * GET /api/reservations/my  (api-specification.md §6.4)
     * Query: status, p, s — TODO: 페이징 구현 (#81 이후)
     */
    @Operation(summary = "내 예약 목록 조회", description = "로그인한 사용자의 모든 예약 내역을 최신순으로 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<UserReservationResponseDto>>> getMyReservations(
            @Parameter(description = "사용자 ID (임시)", example = "1")
            @RequestHeader("X-User-Id") Long userId) {

        List<UserReservationResponseDto> responses = reservationQueryUseCase.getUserReservations(userId);
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    /**
     * 공용시설 예약 신청
     * POST /api/reservations  (api-specification.md §6.3)
     *
     * @param userId  요청한 사용자 ID (임시 헤더)
     * @param request 예약 생성 정보
     * @return 생성된 예약 ID
     */
    @Operation(
            summary = "공용시설 예약 신청",
            description = "특정 시설의 예약을 신청합니다. 이미 확정된 다른 예약과 시간이 겹치면 거절됩니다(동시성 차단)."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Long>>> createReservation(
            @Parameter(description = "사용자 ID (임시)", example = "1")
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ReservationCreateRequestDto request) {

        Long reservationId = reservationCommandUseCase.reserveFacility(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("reservationId", reservationId)));
    }

    /**
     * 공용시설 예약 취소
     * POST /api/reservations/{id}/cancel  (api-specification.md §6.5)
     *
     * PENDING 또는 APPROVED 상태의 예약만 취소 가능합니다.
     * COMPLETED/CANCELLED 상태에서 취소 시도 시 409 INVALID_STATUS 에러 반환.
     */
    @Operation(summary = "공용시설 예약 취소", description = "본인의 승인 또는 대기 중인 예약을 취소합니다. COMPLETED/CANCELLED 상태에서는 취소 불가.")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @Parameter(description = "사용자 ID (임시)", example = "1")
            @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "취소할 예약 ID", example = "999")
            @PathVariable("id") Long reservationId) {

        reservationCommandUseCase.cancelReservation(userId, reservationId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
