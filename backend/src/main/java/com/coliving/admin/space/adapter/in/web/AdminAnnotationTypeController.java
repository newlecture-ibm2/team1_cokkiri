package com.coliving.admin.space.adapter.in.web;

import com.coliving.admin.space.adapter.in.web.dto.req.CreateAnnotationTypeRequestDto;
import com.coliving.admin.space.adapter.in.web.dto.req.UpdateAnnotationTypeRequestDto;
import com.coliving.admin.space.adapter.in.web.dto.res.AdminAnnotationTypeResponseDto;
import com.coliving.admin.space.application.command.CreateAnnotationTypeCommand;
import com.coliving.admin.space.application.command.UpdateAnnotationTypeCommand;
import com.coliving.admin.space.application.port.in.AdminAnnotationTypeUseCase;
import com.coliving.global.dto.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Annotation Type", description = "관리자 어노테이션(비공간 요소) 유형 관리 API")
@RestController
@RequestMapping("/api/admin/annotation-types")
@RequiredArgsConstructor
public class AdminAnnotationTypeController {

    private final AdminAnnotationTypeUseCase adminAnnotationTypeUseCase;

    @Operation(summary = "어노테이션 유형 목록 조회")
    @GetMapping
    public ApiResponse<List<AdminAnnotationTypeResponseDto>> getAnnotationTypes() {
        List<AdminAnnotationTypeResponseDto> result = adminAnnotationTypeUseCase.getAnnotationTypes().stream()
                .map(AdminAnnotationTypeResponseDto::from)
                .toList();
        return ApiResponse.ok(result);
    }

    @Operation(summary = "어노테이션 유형 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminAnnotationTypeResponseDto> createAnnotationType(
            @Valid @RequestBody CreateAnnotationTypeRequestDto request) {
        CreateAnnotationTypeCommand command = CreateAnnotationTypeCommand.builder()
                .code(request.getCode())
                .name(request.getName())
                .iconName(request.getIconName())
                .defaultColor(request.getDefaultColor())
                .build();
        return ApiResponse.ok(AdminAnnotationTypeResponseDto.from(
                adminAnnotationTypeUseCase.createAnnotationType(command)));
    }

    @Operation(summary = "어노테이션 유형 수정")
    @PutMapping("/{annotationTypeId}")
    public ApiResponse<AdminAnnotationTypeResponseDto> updateAnnotationType(
            @PathVariable Long annotationTypeId,
            @Valid @RequestBody UpdateAnnotationTypeRequestDto request) {
        UpdateAnnotationTypeCommand command = UpdateAnnotationTypeCommand.builder()
                .annotationTypeId(annotationTypeId)
                .name(request.getName())
                .iconName(request.getIconName())
                .defaultColor(request.getDefaultColor())
                .build();
        return ApiResponse.ok(AdminAnnotationTypeResponseDto.from(
                adminAnnotationTypeUseCase.updateAnnotationType(command)));
    }

    @Operation(summary = "어노테이션 유형 삭제")
    @DeleteMapping("/{annotationTypeId}")
    public ApiResponse<Void> deleteAnnotationType(@PathVariable Long annotationTypeId) {
        adminAnnotationTypeUseCase.deleteAnnotationType(annotationTypeId);
        return ApiResponse.ok(null);
    }
}
