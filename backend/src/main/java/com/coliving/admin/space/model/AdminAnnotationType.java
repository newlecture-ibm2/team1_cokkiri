package com.coliving.admin.space.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminAnnotationType {
    private Long annotationTypeId;
    private String code;          // 예: DOOR, STAIRS, ELEVATOR, CUSTOM_1
    private String name;          // 관리자가 지정한 한글 표시명
    private String iconName;      // Lucide 아이콘 이름 (예: DoorOpen, ArrowUpDown)
    private String defaultColor;  // theme 프리셋 키 (primary, accent, muted, secondary)
    private Boolean isSystemDefault;
}
