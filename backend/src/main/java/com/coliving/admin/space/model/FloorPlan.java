package com.coliving.admin.space.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * 평면도 도메인 모델 — 층별 배경 설계도 + 비공간 요소.
 */
@Getter
@Builder
@AllArgsConstructor
public class FloorPlan {

    private final Long floorPlanId;
    private final Integer floor;
    private final String blueprintUrl;
    private final BigDecimal blueprintOpacity;
    private final List<FloorAnnotation> annotations;
}
