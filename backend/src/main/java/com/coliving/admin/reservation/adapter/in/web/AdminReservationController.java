package com.coliving.admin.reservation.adapter.in.web;

import com.coliving.admin.reservation.adapter.in.web.dto.res.AdminReservationResponseDto;
import com.coliving.admin.reservation.application.port.in.AdminReservationCommandUseCase;
import com.coliving.admin.reservation.application.port.in.AdminReservationQueryUseCase;
import com.coliving.global.dto.ApiResponse;
import com.coliving.reservation.model.ReservationStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자용 예약 관리 REST Controller
 *
 * #82: GET  /api/admin/reservations              — 전체 예약 목록 조회 (상태 필터 + 페이지네이션)
 *      POST /api/admin/reservations/{id}/approve — 예약 승인
 *      POST /api/admin/reservations/{id}/cancel  — 예약 취소
 *
 * [아키텍처 규칙 준수]
 * - 위치: admin/reservation/adapter/in/web/ (03-backend-architecture.md §1-2)
 * - Admin 전용 UseCase(AdminReservationQueryUseCase, AdminReservationCommandUseCase)만 DI
 * - 04-domain-collaboration §1: reservation 도메인 UseCase 직접 DI 금지 → Admin 전용으로 분리
 * - api-specification.md §14.1: 경로 및 메서드 준수 (POST /approve, POST /cancel)
 * - 01-general-convention.md §3: @PreAuthorize("hasRole('ADMIN')") 적용
 */
@Tag(name = "Admin-Reservation", description = "관리자 전용 예약 관리 API (#82)")
@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationController {

    private final AdminReservationQueryUseCase adminReservationQueryUseCase;
    private final AdminReservationCommandUseCase adminReservationCommandUseCase;

    /**
     * 전체 예약 목록 조회
     *
     * GET /api/admin/reservations?status=PENDING&p=0&s=20
     *
     * @param status 상태 필터 (PENDING/APPROVED/CANCELLED/COMPLETED, 미입력 시 전체)
     * @param p      페이지 번호 (0-based, 기본값 0)
     * @param s      페이지 크기 (기본값 20)
     */
    @Operation(summary = "전체 예약 목록 조회", description = "모든 입주자의 예약 내역을 상태 필터 및 페이지네이션으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminReservationResponseDto>>> getAllReservations(
            @Parameter(description = "예약 상태 필터 (미입력 시 전체)", example = "PENDING")
            @RequestParam(required = false) ReservationStatus status,
            @Parameter(description = "페이지 번호 (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int p,
            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(defaultValue = "20") int s) {

        Pageable pageable = PageRequest.of(p, s);
        Page<AdminReservationResponseDto> result = adminReservationQueryUseCase.getAllReservations(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * 예약 승인 (PENDING → APPROVED)
     *
     * POST /api/admin/reservations/{id}/approve
     * api-specification.md §14.1
     */
    @Operation(summary = "예약 승인", description = "PENDING 상태의 예약을 APPROVED로 승인합니다.")
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveReservation(
            @Parameter(description = "예약 ID", example = "100")
            @PathVariable("id") Long reservationId) {

        // TODO: JWT 연동 후 @AuthenticationPrincipal로 adminId 추출 예정
        Long adminId = 1L; // 임시 — SecurityContext에서 추출 필요
        adminReservationCommandUseCase.approveReservation(adminId, reservationId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /**
     * 예약 취소 (PENDING | APPROVED → CANCELLED)
     *
     * POST /api/admin/reservations/{id}/cancel
     * api-specification.md §14.1
     */
    @Operation(summary = "예약 취소", description = "관리자가 예약을 강제 취소(CANCELLED)합니다.")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @Parameter(description = "예약 ID", example = "100")
            @PathVariable("id") Long reservationId) {

        adminReservationCommandUseCase.cancelReservation(1L, reservationId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
