package com.coliving.admin.space.application.command;

import com.coliving.admin.space.model.FloorAnnotation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class SaveFloorPlanCommand {

    private final Integer floor;
    private final BigDecimal blueprintOpacity;
    private final List<FloorAnnotation> annotations;
}
