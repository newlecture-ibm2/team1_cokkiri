package com.coliving.admin.space.application.result;

import com.coliving.admin.space.model.AdminAnnotationType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminAnnotationTypeResult {
    private Long annotationTypeId;
    private String code;
    private String name;
    private String iconName;
    private String defaultColor;
    private Boolean isSystemDefault;

    public static AdminAnnotationTypeResult from(AdminAnnotationType model) {
        return AdminAnnotationTypeResult.builder()
                .annotationTypeId(model.getAnnotationTypeId())
                .code(model.getCode())
                .name(model.getName())
                .iconName(model.getIconName())
                .defaultColor(model.getDefaultColor())
                .isSystemDefault(model.getIsSystemDefault())
                .build();
    }
}
