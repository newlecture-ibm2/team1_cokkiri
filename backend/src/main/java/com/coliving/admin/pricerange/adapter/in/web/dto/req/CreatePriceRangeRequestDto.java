package com.coliving.admin.pricerange.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreatePriceRangeRequestDto {
    @NotBlank(message = "라벨은 필수입니다.")
    private String label;
    private Integer minRent;
    private Integer maxRent;
    private Boolean isActive;
}
