package com.coliving.common.profile.adapter.in.web;

import com.coliving.common.profile.adapter.in.web.dto.res.NationalityResponseDto;
import com.coliving.common.profile.application.port.in.ViewNationalityListUseCase;
import com.coliving.common.profile.application.result.NationalityListResult;
import com.coliving.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/nationalities")
@RequiredArgsConstructor
public class NationalityController {

    private final ViewNationalityListUseCase viewNationalityListUseCase;

    @GetMapping
    public ApiResponse<List<NationalityResponseDto>> getNationalities() {
        List<NationalityListResult> results = viewNationalityListUseCase.execute();
        List<NationalityResponseDto> response = results.stream()
                .map(result -> NationalityResponseDto.builder()
                        .code(result.code())
                        .nameKo(result.nameKo())
                        .nameEn(result.nameEn())
                        .nameNative(result.nameNative())
                        .build())
                .toList();
        return ApiResponse.ok(response);
    }
}
