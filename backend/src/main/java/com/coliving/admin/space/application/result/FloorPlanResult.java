package com.coliving.admin.space.application.result;

import com.coliving.admin.space.model.FloorAnnotation;
import com.coliving.admin.space.model.FloorPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class FloorPlanResult {

    private final Long floorPlanId;
    private final Integer floor;
    private final String blueprintUrl;
    private final BigDecimal blueprintOpacity;
    private final List<FloorAnnotation> annotations;

    public static FloorPlanResult from(FloorPlan model) {
        return FloorPlanResult.builder()
                .floorPlanId(model.getFloorPlanId())
                .floor(model.getFloor())
                .blueprintUrl(model.getBlueprintUrl())
                .blueprintOpacity(model.getBlueprintOpacity())
                .annotations(model.getAnnotations())
                .build();
    }
}
