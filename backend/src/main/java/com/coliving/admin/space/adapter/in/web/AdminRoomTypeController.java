package com.coliving.admin.space.adapter.in.web;

import com.coliving.admin.space.adapter.in.web.dto.req.CreateRoomTypeRequestDto;
import com.coliving.admin.space.adapter.in.web.dto.req.UpdateRoomTypeRequestDto;
import com.coliving.admin.space.adapter.in.web.dto.res.AdminRoomTypeResponseDto;
import com.coliving.admin.space.application.command.CreateRoomTypeCommand;
import com.coliving.admin.space.application.command.UpdateRoomTypeCommand;
import com.coliving.admin.space.application.port.in.AdminRoomTypeUseCase;
import com.coliving.global.dto.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Room Type", description = "관리자 방 유형 관리 API")
@RestController
@RequestMapping("/api/admin/room-types")
@RequiredArgsConstructor
public class AdminRoomTypeController {

    private final AdminRoomTypeUseCase adminRoomTypeUseCase;

    @Operation(summary = "방 유형 목록 조회")
    @GetMapping
    public ApiResponse<List<AdminRoomTypeResponseDto>> getRoomTypes() {
        List<AdminRoomTypeResponseDto> result = adminRoomTypeUseCase.getRoomTypes().stream()
                .map(AdminRoomTypeResponseDto::from)
                .toList();
        return ApiResponse.ok(result);
    }

    @Operation(summary = "방 유형 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminRoomTypeResponseDto> createRoomType(@Valid @RequestBody CreateRoomTypeRequestDto request) {
        CreateRoomTypeCommand command = CreateRoomTypeCommand.builder()
                .code(request.getCode())
                .name(request.getName())
                .build();
        return ApiResponse.ok(AdminRoomTypeResponseDto.from(adminRoomTypeUseCase.createRoomType(command)));
    }

    @Operation(summary = "방 유형 수정")
    @PutMapping("/{roomTypeId}")
    public ApiResponse<AdminRoomTypeResponseDto> updateRoomType(
            @PathVariable Long roomTypeId,
            @Valid @RequestBody UpdateRoomTypeRequestDto request) {
        UpdateRoomTypeCommand command = UpdateRoomTypeCommand.builder()
                .roomTypeId(roomTypeId)
                .name(request.getName())
                .build();
        return ApiResponse.ok(AdminRoomTypeResponseDto.from(adminRoomTypeUseCase.updateRoomType(command)));
    }

    @Operation(summary = "방 유형 삭제")
    @DeleteMapping("/{roomTypeId}")
    public ApiResponse<Void> deleteRoomType(@PathVariable Long roomTypeId) {
        adminRoomTypeUseCase.deleteRoomType(roomTypeId);
        return ApiResponse.ok(null);
    }

    @Operation(summary = "방 유형 순서 변경")
    @PutMapping("/order")
    public ApiResponse<Void> updateRoomTypeOrder(@RequestBody java.util.List<Long> orderedIds) {
        adminRoomTypeUseCase.updateRoomTypeOrder(orderedIds);
        return ApiResponse.ok(null, "순서가 저장되었습니다.");
    }
}
