package com.coliving.admin.space.application.port.in;

import com.coliving.admin.space.application.command.CreatePriceRangeCommand;
import com.coliving.admin.space.application.command.UpdatePriceRangeCommand;
import com.coliving.admin.space.application.result.AdminPriceRangeResult;

import java.util.List;

public interface AdminPriceRangeUseCase {
    List<AdminPriceRangeResult> getPriceRanges();
    AdminPriceRangeResult createPriceRange(CreatePriceRangeCommand command);
    AdminPriceRangeResult updatePriceRange(UpdatePriceRangeCommand command);
    void deletePriceRange(Long priceRangePresetId);
    void updatePriceRangeOrder(List<Long> orderedIds);
}
