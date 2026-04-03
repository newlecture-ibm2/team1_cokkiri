package com.coliving.reservation.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.reservation.adapter.in.web.dto.ReservationCreateRequest;
import com.coliving.reservation.adapter.in.web.dto.UserReservationResponse;
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
 * 예약 생성 REST Controller
 *
 * RSV-4.4: 예약 동시성 차단 신청 로직을 포함한 API를 제공한다.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ [TODO - Auth 연동 시 수정 필요]                                │
 * │ 현재 헤더(X-User-Id)로 사용자 ID를 받고 있으나,                  │
 * │ 추후 Spring Security의 @AuthenticationPrincipal 등으로 인증       │
 * │ 객체에서 userId를 추출하도록 변경해야 합니다.                    │
 * └──────────────────────────────────────────────────────────────────┘
 */
@Tag(name = "Reservation", description = "예약 신청 및 관리 API (RSV-4.4)")
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationCommandUseCase reservationCommandUseCase;
    private final ReservationQueryUseCase reservationQueryUseCase;

    /**
     * 사용자 본인의 예약 목록 조회
     */
    @Operation(summary = "내 예약 목록 조회", description = "로그인한 사용자의 모든 예약 내역을 최신순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserReservationResponse>>> getMyReservations(
            @Parameter(description = "사용자 ID (임시)", example = "1")
            @RequestHeader("X-User-Id") Long userId) {

        List<UserReservationResponse> responses = reservationQueryUseCase.getUserReservations(userId);
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    /**
     * 공용시설 예약 신청
     *
     * @param userId 요청한 사용자 ID (임시 헤더)
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
            @Valid @RequestBody ReservationCreateRequest request) {

        Long reservationId = reservationCommandUseCase.reserveFacility(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("reservationId", reservationId)));
    }

    /**
     * 공용시설 예약 취소
     */
    @Operation(summary = "공용시설 예약 취소", description = "본인의 승인 또는 대기 중인 예약을 취소합니다.")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @Parameter(description = "사용자 ID (임시)", example = "1")
            @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "취소할 예약 ID", example = "999")
            @PathVariable("id") Long reservationId) {

        reservationCommandUseCase.cancelReservation(userId, reservationId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
