package com.coliving.admin.space.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 평면도 비공간 요소 (JSONB 직렬화용 VO).
 * floor_plans.annotations 컬럼에 List 형태로 저장된다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloorAnnotation {

    private String id;          // 프론트에서 생성하는 UUID
    private String label;
    private String iconType;    // DOOR, STAIRS, GARDEN, ELEVATOR, RESTROOM, CUSTOM 등 (annotation_types.code)
    private String iconName;    // Lucide 아이콘 이름 (예: DoorOpen, ArrowUpDown)
    private Integer positionX;
    private Integer positionY;
    private Integer positionW;
    private Integer positionH;
    private String color;       // theme 프리셋 키
}
