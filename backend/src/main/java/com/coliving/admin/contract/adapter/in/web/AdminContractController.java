package com.coliving.admin.contract.adapter.in.web;

import com.coliving.admin.contract.adapter.in.web.dto.req.AdminApproveContractRequestDto;
import com.coliving.admin.contract.adapter.in.web.dto.req.AdminCreateContractRequestDto;
import com.coliving.admin.contract.adapter.in.web.dto.req.AdminRejectContractRequestDto;
import com.coliving.admin.contract.adapter.in.web.dto.req.AdminUpdateContractRequestDto;
import com.coliving.admin.contract.application.command.AdminApproveContractCommand;
import com.coliving.admin.contract.application.command.AdminCreateContractCommand;
import com.coliving.admin.contract.application.command.AdminRejectContractCommand;
import com.coliving.admin.contract.application.command.AdminUpdateContractCommand;
import com.coliving.admin.contract.application.port.in.AdminContractUseCase;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.admin.contract.application.result.AdminContractResult;
import com.coliving.global.dto.ApiResponse;
import com.coliving.user.contract.model.ContractStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Contract", description = "관리자용 계약 관리 API")
@RestController
@RequestMapping("/api/admin/contracts")
@RequiredArgsConstructor
public class AdminContractController {

    private final AdminContractUseCase adminContractUseCase;

    // ── ADM-CTR-01: 전체 계약 목록 조회 ──

    @Operation(summary = "전체 계약 목록 조회", description = "모든 계약을 조회합니다. 상태 필터를 선택적으로 적용할 수 있습니다.")
    @GetMapping
    public ApiResponse<List<AdminContractListResult>> viewAllContracts(
            @RequestParam(value = "status", required = false) ContractStatus status) {
        return ApiResponse.ok(adminContractUseCase.viewAllContracts(status));
    }

    // ── ADM-CTR-05: 신청 목록 조회 ──

    @Operation(summary = "승인 대기 중인 신청 목록 조회", description = "상태가 PENDING인 모든 입주 신청 내역을 조회합니다.")
    @GetMapping("/applications")
    public ApiResponse<List<AdminContractListResult>> viewPendingContracts() {
        return ApiResponse.ok(adminContractUseCase.viewPendingContracts());
    }

    // ── ADM-CTR-02: 관리자 직접 등록 ──

    @Operation(summary = "계약 직접 등록", description = "관리자가 직접 계약을 등록합니다 (ACTIVE 직행).")
    @PostMapping
    public ApiResponse<AdminContractResult> createContract(
            @RequestBody @Valid AdminCreateContractRequestDto requestDto) {

        Long adminId = getAdminId();

        AdminCreateContractCommand command = AdminCreateContractCommand.builder()
                .userId(requestDto.getUserId())
                .spaceId(requestDto.getSpaceId())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .monthlyRent(requestDto.getMonthlyRent())
                .deposit(requestDto.getDeposit())
                .build();

        return ApiResponse.ok(adminContractUseCase.createContract(adminId, command));
    }

    // ── ADM-CTR-03: 계약 수정 ──

    @Operation(summary = "계약 수정", description = "계약 기간, 임대료 등을 수정합니다. TERMINATED 상태는 수정 불가합니다.")
    @PutMapping("/{id}")
    public ApiResponse<AdminContractResult> updateContract(
            @PathVariable("id") Long contractId,
            @RequestBody @Valid AdminUpdateContractRequestDto requestDto) {

        Long adminId = getAdminId();

        AdminUpdateContractCommand command = AdminUpdateContractCommand.builder()
                .contractId(contractId)
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .monthlyRent(requestDto.getMonthlyRent())
                .deposit(requestDto.getDeposit())
                .specialTerms(requestDto.getSpecialTerms())
                .build();

        return ApiResponse.ok(adminContractUseCase.updateContract(adminId, command));
    }

    // ── ADM-CTR-04: 만료 처리 ──

    @Operation(summary = "계약 만료 처리", description = "ACTIVE 계약을 EXPIRED로 전환합니다.")
    @PostMapping("/{id}/expire")
    public ApiResponse<AdminContractResult> expireContract(
            @PathVariable("id") Long contractId) {
        Long adminId = getAdminId();
        return ApiResponse.ok(adminContractUseCase.expireContract(adminId, contractId));
    }

    // ── ADM-CTR-04: 해지 처리 ──

    @Operation(summary = "계약 해지 처리", description = "ACTIVE 계약을 TERMINATED로 전환합니다.")
    @PostMapping("/{id}/terminate")
    public ApiResponse<AdminContractResult> terminateContract(
            @PathVariable("id") Long contractId) {
        Long adminId = getAdminId();
        return ApiResponse.ok(adminContractUseCase.terminateContract(adminId, contractId));
    }

    // ── ADM-CTR-05: 신청 승인 ──

    @Operation(summary = "신청 승인", description = "신청서를 승인하고 계약 조건을 확정합니다.")
    @PostMapping("/{id}/approve")
    public ApiResponse<AdminContractResult> approveContract(
            @PathVariable("id") Long contractId,
            @RequestBody @Valid AdminApproveContractRequestDto requestDto) {

        Long adminId = getAdminId();

        AdminApproveContractCommand command = AdminApproveContractCommand.builder()
                .contractId(contractId)
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .monthlyRent(requestDto.getMonthlyRent())
                .deposit(requestDto.getDeposit())
                .specialTerms(requestDto.getSpecialTerms())
                .build();

        return ApiResponse.ok(adminContractUseCase.approveContract(adminId, command));
    }

    // ── ADM-CTR-05: 신청 반려 ──

    @Operation(summary = "신청 반려", description = "신청서를 반려하고 사유를 남깁니다.")
    @PostMapping("/{id}/reject")
    public ApiResponse<AdminContractResult> rejectContract(
            @PathVariable("id") Long contractId,
            @RequestBody @Valid AdminRejectContractRequestDto requestDto) {

        Long adminId = getAdminId();

        AdminRejectContractCommand command = AdminRejectContractCommand.builder()
                .contractId(contractId)
                .rejectedReason(requestDto.getRejectedReason())
                .build();

        return ApiResponse.ok(adminContractUseCase.rejectContract(adminId, command));
    }

    // ── JWT에서 관리자 ID 추출 ──

    private Long getAdminId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            try {
                return Long.parseLong(auth.getName());
            } catch (NumberFormatException e) {
                return 1L; // fallback
            }
        }
        return 1L; // fallback
    }
}
