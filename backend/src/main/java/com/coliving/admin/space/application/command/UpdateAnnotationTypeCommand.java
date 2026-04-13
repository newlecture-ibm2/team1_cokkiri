package com.coliving.admin.space.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateAnnotationTypeCommand {
    private Long annotationTypeId;
    private String name;
    private String iconName;
    private String defaultColor;
}
