package com.coliving.admin.pricerange.adapter.in.web;

import com.coliving.admin.pricerange.adapter.in.web.dto.req.CreatePriceRangeRequestDto;
import com.coliving.admin.pricerange.adapter.in.web.dto.req.UpdatePriceRangeOrderRequestDto;
import com.coliving.admin.pricerange.adapter.in.web.dto.req.UpdatePriceRangeRequestDto;
import com.coliving.admin.pricerange.adapter.in.web.dto.res.AdminPriceRangeResponseDto;
import com.coliving.admin.pricerange.application.command.CreatePriceRangeCommand;
import com.coliving.admin.pricerange.application.command.UpdatePriceRangeCommand;
import com.coliving.admin.pricerange.application.port.in.AdminPriceRangeUseCase;
import com.coliving.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/price-ranges")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPriceRangeController {

    private final AdminPriceRangeUseCase adminPriceRangeUseCase;

    @GetMapping
    public ApiResponse<List<AdminPriceRangeResponseDto>> getPriceRanges() {
        List<AdminPriceRangeResponseDto> data = adminPriceRangeUseCase.getPriceRanges().stream()
                .map(AdminPriceRangeResponseDto::from)
                .toList();
        return ApiResponse.ok(data);
    }

    @PostMapping
    public ApiResponse<AdminPriceRangeResponseDto> createPriceRange(@RequestBody @Valid CreatePriceRangeRequestDto request) {
        CreatePriceRangeCommand command = CreatePriceRangeCommand.builder()
                .label(request.getLabel())
                .minRent(request.getMinRent())
                .maxRent(request.getMaxRent())
                .isActive(request.getIsActive())
                .build();
        return ApiResponse.ok(AdminPriceRangeResponseDto.from(adminPriceRangeUseCase.createPriceRange(command)));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminPriceRangeResponseDto> updatePriceRange(@PathVariable("id") Long id, @RequestBody @Valid UpdatePriceRangeRequestDto request) {
        UpdatePriceRangeCommand command = UpdatePriceRangeCommand.builder()
                .priceRangePresetId(id)
                .label(request.getLabel())
                .minRent(request.getMinRent())
                .maxRent(request.getMaxRent())
                .isActive(request.getIsActive())
                .build();
        return ApiResponse.ok(AdminPriceRangeResponseDto.from(adminPriceRangeUseCase.updatePriceRange(command)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePriceRange(@PathVariable("id") Long id) {
        adminPriceRangeUseCase.deletePriceRange(id);
        return ApiResponse.ok(null, "가격대 프리셋이 삭제되었습니다.");
    }

    @PutMapping("/order")
    public ApiResponse<Void> updateOrder(@RequestBody @Valid UpdatePriceRangeOrderRequestDto request) {
        adminPriceRangeUseCase.updatePriceRangeOrder(request.getOrderedIds());
        return ApiResponse.ok(null, "순서가 변경되었습니다.");
    }
}
