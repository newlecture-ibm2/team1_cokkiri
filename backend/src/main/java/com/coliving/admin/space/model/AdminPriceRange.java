package com.coliving.admin.space.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminPriceRange {
    private final Long priceRangePresetId;
    private final String label;
    private final Integer minRent;
    private final Integer maxRent;
    private final Integer sortOrder;
    private final Boolean isActive;
}
