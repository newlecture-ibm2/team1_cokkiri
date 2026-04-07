package com.coliving.admin.contract.adapter.in.web;

import com.coliving.admin.contract.adapter.in.web.dto.req.AdminApproveContractRequestDto;
import com.coliving.admin.contract.adapter.in.web.dto.req.AdminRejectContractRequestDto;
import com.coliving.admin.contract.application.command.AdminApproveContractCommand;
import com.coliving.admin.contract.application.command.AdminRejectContractCommand;
import com.coliving.admin.contract.application.port.in.AdminContractUseCase;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.admin.contract.application.result.AdminContractResult;
import com.coliving.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Contract", description = "관리자용 계약 관리 API")
@RestController
@RequestMapping("/api/admin/contracts")
@RequiredArgsConstructor
public class AdminContractController {

    private final AdminContractUseCase adminContractUseCase;

    @Operation(summary = "승인 대기 중인 신청 목록 조회", description = "상태가 PENDING인 모든 입주 신청 내역을 조회합니다.")
    @GetMapping("/applications")
    public ApiResponse<List<AdminContractListResult>> viewPendingContracts() {
        return ApiResponse.ok(adminContractUseCase.viewPendingContracts());
    }

    @Operation(summary = "신청 승인", description = "신청서를 승인하고 계약 조건을 확정합니다.")
    @PostMapping("/{id}/approve")
    public ApiResponse<AdminContractResult> approveContract(
            @PathVariable("id") Long contractId,
            @RequestBody @Valid AdminApproveContractRequestDto requestDto) {
        
        Long adminId = 1L; // JWT implementation pending
        
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

    @Operation(summary = "신청 반려", description = "신청서를 반려하고 사유를 남깁니다.")
    @PostMapping("/{id}/reject")
    public ApiResponse<AdminContractResult> rejectContract(
            @PathVariable("id") Long contractId,
            @RequestBody @Valid AdminRejectContractRequestDto requestDto) {
            
        Long adminId = 1L; // JWT implementation pending
        
        AdminRejectContractCommand command = AdminRejectContractCommand.builder()
                .contractId(contractId)
                .rejectedReason(requestDto.getRejectedReason())
                .build();
                
        return ApiResponse.ok(adminContractUseCase.rejectContract(adminId, command));
    }
}
