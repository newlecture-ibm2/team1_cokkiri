package com.coliving.user.floor.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.user.floor.adapter.in.web.dto.FloorViewResponseDto;
import com.coliving.user.floor.application.port.in.FloorViewUseCase;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Floor", description = "층별 평면도 조회 API (Public)")
@RestController
@RequestMapping("/api/floors")
@RequiredArgsConstructor
public class FloorController {

    private final FloorViewUseCase floorViewUseCase;

    @Operation(summary = "전체 층별 평면도 조회 (Public)",
               description = "전체 층의 공간 블록, 어노테이션, 배경 도면 정보를 조회합니다. 비로그인 사용자도 접근 가능합니다.")
    @GetMapping
    public ApiResponse<List<FloorViewResponseDto>> getAllFloors() {
        List<FloorViewResponseDto> result = floorViewUseCase.getAllFloors()
                .stream()
                .map(FloorViewResponseDto::from)
                .toList();

        return ApiResponse.ok(result);
    }
}
