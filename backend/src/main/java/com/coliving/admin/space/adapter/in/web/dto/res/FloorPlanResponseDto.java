package com.coliving.admin.space.adapter.in.web.dto.res;

import com.coliving.admin.space.application.result.FloorPlanResult;
import com.coliving.admin.space.model.FloorAnnotation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class FloorPlanResponseDto {

    private Long floorPlanId;
    private Integer floor;
    private String blueprintUrl;
    private BigDecimal blueprintOpacity;
    private List<FloorAnnotation> annotations;

    public static FloorPlanResponseDto from(FloorPlanResult result) {
        return FloorPlanResponseDto.builder()
                .floorPlanId(result.getFloorPlanId())
                .floor(result.getFloor())
                .blueprintUrl(result.getBlueprintUrl())
                .blueprintOpacity(result.getBlueprintOpacity())
                .annotations(result.getAnnotations())
                .build();
    }
}
