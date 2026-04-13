package com.coliving.user.floor.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * 사용자용 층별 평면도 도메인 모델 (읽기 전용).
 * 관리자 전용 민감 정보(임대료, 기기장애 등)는 포함하지 않는다.
 */
@Getter
@Builder
public class FloorView {

    private Integer floor;
    private String blueprintUrl;
    private BigDecimal blueprintOpacity;
    private List<SpaceBlock> spaces;
    private List<Annotation> annotations;

    @Getter
    @Builder
    public static class SpaceBlock {
        private Long spaceId;
        private String name;
        private String type;       // PRIVATE | COMMON
        private String status;     // AVAILABLE | OCCUPIED | MAINTENANCE
        private String roomTypeName; // nullable (PRIVATE만)
        private Integer positionX;
        private Integer positionY;
        private Integer positionW;
        private Integer positionH;
    }

    @Getter
    @Builder
    public static class Annotation {
        private String label;
        private String annotationTypeCode;
        private String iconName;
        private String color;
        private Integer positionX;
        private Integer positionY;
        private Integer positionW;
        private Integer positionH;
    }
}
