package com.coliving.admin.pricerange.application.result;

import com.coliving.admin.pricerange.model.AdminPriceRange;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminPriceRangeResult {
    private final Long priceRangePresetId;
    private final String label;
    private final Integer minRent;
    private final Integer maxRent;
    private final Integer sortOrder;
    private final Boolean isActive;

    public static AdminPriceRangeResult from(AdminPriceRange model) {
        return AdminPriceRangeResult.builder()
                .priceRangePresetId(model.getPriceRangePresetId())
                .label(model.getLabel())
                .minRent(model.getMinRent())
                .maxRent(model.getMaxRent())
                .sortOrder(model.getSortOrder())
                .isActive(model.getIsActive())
                .build();
    }
}
