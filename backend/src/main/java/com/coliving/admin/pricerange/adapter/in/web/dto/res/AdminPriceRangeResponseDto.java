package com.coliving.admin.pricerange.adapter.in.web.dto.res;

import com.coliving.admin.pricerange.application.result.AdminPriceRangeResult;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminPriceRangeResponseDto {
    private final Long priceRangePresetId;
    private final String label;
    private final Integer minRent;
    private final Integer maxRent;
    private final Integer sortOrder;
    private final Boolean isActive;

    public static AdminPriceRangeResponseDto from(AdminPriceRangeResult result) {
        return AdminPriceRangeResponseDto.builder()
                .priceRangePresetId(result.getPriceRangePresetId())
                .label(result.getLabel())
                .minRent(result.getMinRent())
                .maxRent(result.getMaxRent())
                .sortOrder(result.getSortOrder())
                .isActive(result.getIsActive())
                .build();
    }
}
