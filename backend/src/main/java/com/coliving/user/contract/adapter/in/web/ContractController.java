package com.coliving.user.contract.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.user.contract.adapter.in.web.dto.req.ContractApplyRequestDto;
import com.coliving.user.contract.application.command.ContractApplyCommand;
import com.coliving.user.contract.application.port.in.ContractUseCase;
import com.coliving.user.contract.application.result.ContractResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.coliving.user.contract.application.result.ContractDraftResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Contract", description = "입주 계약 관련 API")
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractUseCase contractUseCase;

    @Operation(summary = "내 계약 내역 조회", description = "로그인한 사용자의 모든 계약(신청 포함) 내역을 조회합니다.")
    @GetMapping("/my")
    public ApiResponse<List<ContractDraftResult>> getMyContracts() {
        Long userId = 1L; // JWT 도입 전까지 하드코딩
        List<ContractDraftResult> results = contractUseCase.getMyContracts(userId);
        return ApiResponse.ok(results);
    }

    @Operation(summary = "계약서 임시저장 본문 조회", description = "공간 ID와 사용자 정보를 기반으로 임시 저장된 계약 정보를 조회합니다.")
    @GetMapping("/draft")
    public ApiResponse<ContractDraftResult> getDraft(@RequestParam Long spaceId) {
        Long userId = 1L; // JWT 도입 전까지 하드코딩
        ContractDraftResult result = contractUseCase.getDraft(userId, spaceId);
        return ApiResponse.ok(result);
    }

    @Operation(summary = "계약서 임시저장", description = "작성 중인 계약 정보를 유효성 검사 없이 임시 저장합니다.")
    @PostMapping("/draft")
    public ApiResponse<Long> saveDraft(@RequestBody ContractApplyRequestDto request) {
        Long userId = 1L;
        ContractApplyCommand command = toCommand(request);
        ContractResult result = contractUseCase.saveDraft(userId, command);
        return ApiResponse.ok(result.getContractId(), result.getMessage());
    }

    @Operation(summary = "계약서 최종 제출", description = "계약 정보를 검증하고 PENDING 상태로 제출합니다.")
    @PostMapping("/submit")
    public ApiResponse<Long> submit(@RequestBody @Valid ContractApplyRequestDto request) {
        Long userId = 1L;
        ContractApplyCommand command = toCommand(request);
        ContractResult result = contractUseCase.submitContract(userId, command);
        return ApiResponse.ok(result.getContractId(), result.getMessage());
    }

    private ContractApplyCommand toCommand(ContractApplyRequestDto dto) {
        return ContractApplyCommand.builder()
                .spaceId(dto.getSpaceId())
                .desiredStartDate(dto.getDesiredStartDate())
                .desiredDurationMonths(dto.getDesiredDurationMonths())
                .address(dto.getAddress())
                .bankAccount(dto.getBankAccount())
                .usagePurpose(dto.getUsagePurpose())
                .privacyAgreed(dto.getPrivacyAgreed())
                .requestNote(dto.getRequestNote())
                .build();
    }
}

