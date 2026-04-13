package com.coliving.user.floor.adapter.in.web.dto;

import com.coliving.user.floor.model.FloorView;
import lombok.Builder;
import lombok.Getter;

/**
 * 사용자용 어노테이션(비공간 요소) DTO.
 */
@Getter
@Builder
public class FloorAnnotationDto {

    private String label;
    private String annotationTypeCode;
    private String iconName;
    private String color;
    private Integer positionX;
    private Integer positionY;
    private Integer positionW;
    private Integer positionH;

    public static FloorAnnotationDto from(FloorView.Annotation annotation) {
        return FloorAnnotationDto.builder()
                .label(annotation.getLabel())
                .annotationTypeCode(annotation.getAnnotationTypeCode())
                .iconName(annotation.getIconName())
                .color(annotation.getColor())
                .positionX(annotation.getPositionX())
                .positionY(annotation.getPositionY())
                .positionW(annotation.getPositionW())
                .positionH(annotation.getPositionH())
                .build();
    }
}
