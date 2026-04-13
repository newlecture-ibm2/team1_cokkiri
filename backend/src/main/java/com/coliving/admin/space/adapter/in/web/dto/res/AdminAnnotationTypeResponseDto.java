package com.coliving.admin.space.adapter.in.web.dto.res;

import com.coliving.admin.space.application.result.AdminAnnotationTypeResult;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminAnnotationTypeResponseDto {
    private Long annotationTypeId;
    private String code;
    private String name;
    private String iconName;
    private String defaultColor;
    private Boolean isSystemDefault;

    public static AdminAnnotationTypeResponseDto from(AdminAnnotationTypeResult result) {
        return AdminAnnotationTypeResponseDto.builder()
                .annotationTypeId(result.getAnnotationTypeId())
                .code(result.getCode())
                .name(result.getName())
                .iconName(result.getIconName())
                .defaultColor(result.getDefaultColor())
                .isSystemDefault(result.getIsSystemDefault())
                .build();
    }
}
