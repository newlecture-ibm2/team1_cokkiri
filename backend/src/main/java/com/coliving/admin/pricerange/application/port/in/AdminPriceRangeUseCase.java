package com.coliving.admin.pricerange.application.port.in;

import com.coliving.admin.pricerange.application.command.CreatePriceRangeCommand;
import com.coliving.admin.pricerange.application.command.UpdatePriceRangeCommand;
import com.coliving.admin.pricerange.application.result.AdminPriceRangeResult;

import java.util.List;

public interface AdminPriceRangeUseCase {
    List<AdminPriceRangeResult> getPriceRanges();
    AdminPriceRangeResult createPriceRange(CreatePriceRangeCommand command);
    AdminPriceRangeResult updatePriceRange(UpdatePriceRangeCommand command);
    void deletePriceRange(Long priceRangePresetId);
    void updatePriceRangeOrder(List<Long> orderedIds);
}
