package com.coliving.admin.pricerange.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdatePriceRangeCommand {
    private final Long priceRangePresetId;
    private final String label;
    private final Integer minRent;
    private final Integer maxRent;
    private final Boolean isActive;
}
