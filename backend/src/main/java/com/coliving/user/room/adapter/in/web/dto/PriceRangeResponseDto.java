package com.coliving.user.room.adapter.in.web.dto;

import com.coliving.admin.space.adapter.out.jpa.PriceRangePresetEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PriceRangeResponseDto {
    private final Long priceRangePresetId;
    private final String label;
    private final Integer minRent;
    private final Integer maxRent;
    private final Integer sortOrder;

    public static PriceRangeResponseDto from(PriceRangePresetEntity entity) {
        return PriceRangeResponseDto.builder()
                .priceRangePresetId(entity.getId())
                .label(entity.getLabel())
                .minRent(entity.getMinRent())
                .maxRent(entity.getMaxRent())
                .sortOrder(entity.getSortOrder())
                .build();
    }
}
