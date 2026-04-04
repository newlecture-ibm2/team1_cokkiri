package com.coliving.reservation.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.reservation.adapter.in.web.dto.AdminReservationResponse;
import com.coliving.reservation.application.port.in.ReservationCommandUseCase;
import com.coliving.reservation.application.port.in.ReservationQueryUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자용 예약 관리 REST Controller
 *
 * RSV-4.5: 예약 모든 내역 조회(82), 예약 수동 승인/반려(83)
 */
@Tag(name = "Admin-Reservation", description = "관리자 전용 예약 관리 API (#82, #83)")
@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
public class AdminReservationController {

    private final ReservationQueryUseCase reservationQueryUseCase;
    private final ReservationCommandUseCase reservationCommandUseCase;

    @Operation(summary = "모든 예약 내역 조회", description = "모든 입주자의 예약 내역을 최신순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminReservationResponse>>> getAllReservations() {
        List<AdminReservationResponse> responses = reservationQueryUseCase.getAllReservations();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @Operation(summary = "예약 승인", description = "특정 예약을 승인(APPROVED) 상태로 변경합니다.")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveReservation(
            @Parameter(description = "관리자 ID (임시)", example = "2")
            @RequestHeader("X-Admin-Id") Long adminId,
            @Parameter(description = "예약 ID", example = "100")
            @PathVariable("id") Long reservationId) {
        
        reservationCommandUseCase.approveReservation(adminId, reservationId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "예약 반려", description = "특정 예약을 반려(CANCELLED) 상태로 변경합니다.")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectReservation(
            @Parameter(description = "관리자 ID (임시)", example = "2")
            @RequestHeader("X-Admin-Id") Long adminId,
            @Parameter(description = "예약 ID", example = "100")
            @PathVariable("id") Long reservationId) {
        
        reservationCommandUseCase.rejectReservation(adminId, reservationId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
