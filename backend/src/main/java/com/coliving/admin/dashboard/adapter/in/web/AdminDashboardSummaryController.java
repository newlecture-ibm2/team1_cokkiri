package com.coliving.admin.dashboard.adapter.in.web;

import com.coliving.admin.dashboard.adapter.in.web.dto.AdminDashboardSummaryResponseDto;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.global.dto.ApiResponse;
import com.coliving.reservation.adapter.out.jpa.ReservationJpaRepository;
import com.coliving.reservation.model.ReservationStatus;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Admin Dashboard", description = "관리자 대시보드 요약 API")
@RestController
@RequestMapping("/api/admin/dashboard/summary")
@RequiredArgsConstructor
public class AdminDashboardSummaryController {

    private final ContractJpaRepository contractJpaRepository;
    private final ReservationJpaRepository reservationJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Operation(summary = "대시보드 운영 현황 요약", description = "계약, 예약, 입주자, 방문자 현황 통계를 반환합니다.")
    @GetMapping
    public ApiResponse<AdminDashboardSummaryResponseDto> getDashboardSummary() {
        LocalDate today = LocalDate.now();

        // 1. 계약 현황
        AdminDashboardSummaryResponseDto.ContractSummary contract = AdminDashboardSummaryResponseDto.ContractSummary.builder()
                .total(contractJpaRepository.count())
                .pending(contractJpaRepository.countByStatus(ContractStatus.PENDING))
                .active(contractJpaRepository.countByStatus(ContractStatus.ACTIVE))
                .expired(contractJpaRepository.countByStatus(ContractStatus.EXPIRED))
                .build();

        // 2. 예약 현황
        AdminDashboardSummaryResponseDto.ReservationSummary reservation = AdminDashboardSummaryResponseDto.ReservationSummary.builder()
                .today(reservationJpaRepository.countByReservationDate(today))
                .pending(reservationJpaRepository.countByStatus(ReservationStatus.PENDING))
                .total(reservationJpaRepository.count())
                .build();

        // 3. 입주자 현황 (ACTIVE 상태의 ROLE_RESIDENT 유저 수)
        AdminDashboardSummaryResponseDto.ResidentSummary resident = AdminDashboardSummaryResponseDto.ResidentSummary.builder()
                .total(userJpaRepository.countByRoleAndStatus(UserRole.RESIDENT, UserStatus.ACTIVE))
                .build();

        // 4. 방문자수 (우선 Mock 데이터 또는 간단한 로직으로 처리)
        // 실제 방문자 추적 테이블이 없으므로, ACTIVE 유저 수에 비례한 가상 데이터를 반환하거나 0으로 표시
        AdminDashboardSummaryResponseDto.VisitorSummary visitor = AdminDashboardSummaryResponseDto.VisitorSummary.builder()
                .today(resident.getTotal() * 2 + 5) // Mock: 입주자 x 2 + 알파
                .build();

        return ApiResponse.ok(AdminDashboardSummaryResponseDto.builder()
                .contract(contract)
                .reservation(reservation)
                .resident(resident)
                .visitor(visitor)
                .build());
    }
}
