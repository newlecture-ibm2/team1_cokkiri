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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Contract", description = "입주 계약 관련 API")
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractUseCase contractUseCase;

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

