package com.coliving.admin.space.adapter.in.web;

import com.coliving.admin.space.adapter.in.web.dto.req.SaveFloorPlanRequestDto;
import com.coliving.admin.space.adapter.in.web.dto.res.FloorPlanResponseDto;
import com.coliving.admin.space.application.command.SaveFloorPlanCommand;
import com.coliving.admin.space.application.port.in.FloorPlanUseCase;
import com.coliving.admin.space.application.result.FloorPlanResult;
import com.coliving.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Admin Floor Plan", description = "관리자 평면도 배경/어노테이션 API")
@RestController
@RequestMapping("/api/admin/floors")
@RequiredArgsConstructor
public class AdminFloorController {

    private final FloorPlanUseCase floorPlanUseCase;

    @Operation(summary = "평면도 조회 (blueprint + annotations)")
    @GetMapping("/{floor}/plan")
    public ApiResponse<FloorPlanResponseDto> getFloorPlan(@PathVariable Integer floor) {
        FloorPlanResult result = floorPlanUseCase.getFloorPlan(floor);
        return ApiResponse.ok(FloorPlanResponseDto.from(result));
    }

    @Operation(summary = "평면도 저장 (opacity + annotations)")
    @PutMapping("/{floor}/plan")
    public ApiResponse<FloorPlanResponseDto> saveFloorPlan(
            @PathVariable Integer floor,
            @RequestBody SaveFloorPlanRequestDto request) {

        SaveFloorPlanCommand command = SaveFloorPlanCommand.builder()
                .floor(floor)
                .blueprintOpacity(request.getBlueprintOpacity())
                .annotations(request.getAnnotations())
                .build();

        FloorPlanResult result = floorPlanUseCase.saveFloorPlan(command);
        return ApiResponse.ok(FloorPlanResponseDto.from(result), "평면도가 저장되었습니다.");
    }

    @Operation(summary = "배경 도면 이미지 업로드")
    @PostMapping("/{floor}/plan/blueprint")
    public ApiResponse<FloorPlanResponseDto> uploadBlueprint(
            @PathVariable Integer floor,
            @RequestParam("file") MultipartFile file) {

        FloorPlanResult result = floorPlanUseCase.uploadBlueprint(floor, file);
        return ApiResponse.ok(FloorPlanResponseDto.from(result), "도면이 업로드되었습니다.");
    }

    @Operation(summary = "배경 도면 이미지 삭제")
    @DeleteMapping("/{floor}/plan/blueprint")
    public ApiResponse<Void> deleteBlueprint(@PathVariable Integer floor) {
        floorPlanUseCase.deleteBlueprint(floor);
        return ApiResponse.ok(null, "도면이 삭제되었습니다.");
    }
}
