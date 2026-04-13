package com.coliving.admin.space.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateAnnotationTypeCommand {
    private String code;
    private String name;
    private String iconName;
    private String defaultColor;
}
