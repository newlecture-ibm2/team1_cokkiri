package com.coliving.user.experience.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.user.experience.adapter.in.web.dto.CommonSpaceResponseDto;
import com.coliving.user.experience.application.port.in.ExperienceUseCase;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Experience", description = "공용시설 소개 API (Public)")
@RestController
@RequestMapping("/api/experience")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceUseCase experienceUseCase;

    @Operation(summary = "전체 공용시설 목록 조회 (EXPERIENCE 소개 페이지용)",
               description = "예약 가능 여부와 무관하게 모든 공용시설을 조회합니다. 비로그인 사용자도 접근 가능합니다.")
    @GetMapping
    public ApiResponse<List<CommonSpaceResponseDto>> getAllCommonSpaces() {
        List<CommonSpaceResponseDto> result = experienceUseCase.getAllCommonSpaces()
                .stream()
                .map(CommonSpaceResponseDto::from)
                .toList();

        return ApiResponse.ok(result);
    }

    @Operation(summary = "특정 공용시설 상세 조회 (EXPERIENCE 상세 페이지용)",
               description = "단일 공용시설의 상세 정보를 조회합니다.")
    @GetMapping("/{spaceId}")
    public ApiResponse<CommonSpaceResponseDto> getCommonSpace(@PathVariable Long spaceId) {
        CommonSpaceResponseDto result = CommonSpaceResponseDto.from(experienceUseCase.getCommonSpace(spaceId));
        return ApiResponse.ok(result);
    }
}
