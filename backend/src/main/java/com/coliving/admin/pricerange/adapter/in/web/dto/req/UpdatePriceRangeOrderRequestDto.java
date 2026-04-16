package com.coliving.admin.pricerange.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class UpdatePriceRangeOrderRequestDto {
    @NotEmpty(message = "순서를 업데이트할 ID 목록이 필요합니다.")
    private List<Long> orderedIds;
}
