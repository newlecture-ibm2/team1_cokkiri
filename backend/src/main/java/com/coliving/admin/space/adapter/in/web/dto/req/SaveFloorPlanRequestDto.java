package com.coliving.admin.space.adapter.in.web.dto.req;

import com.coliving.admin.space.model.FloorAnnotation;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@NoArgsConstructor
public class SaveFloorPlanRequestDto {

    private BigDecimal blueprintOpacity;
    private List<FloorAnnotation> annotations;
}
