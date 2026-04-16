package com.coliving.user.room.adapter.in.web.dto;

import com.coliving.admin.pricerange.adapter.out.jpa.PriceRangePresetEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PublicPriceRangeResponseDto {
    private final Long priceRangePresetId;
    private final String label;
    private final Integer minRent;
    private final Integer maxRent;
    private final Integer sortOrder;

    public static PublicPriceRangeResponseDto from(PriceRangePresetEntity entity) {
        return PublicPriceRangeResponseDto.builder()
                .priceRangePresetId(entity.getId())
                .label(entity.getLabel())
                .minRent(entity.getMinRent())
                .maxRent(entity.getMaxRent())
                .sortOrder(entity.getSortOrder())
                .build();
    }
}
