package com.coliving.admin.pricerange.application.service;

import com.coliving.admin.pricerange.application.command.CreatePriceRangeCommand;
import com.coliving.admin.pricerange.application.command.UpdatePriceRangeCommand;
import com.coliving.admin.pricerange.application.port.in.AdminPriceRangeUseCase;
import com.coliving.admin.pricerange.application.port.out.AdminPriceRangeRepositoryPort;
import com.coliving.admin.pricerange.application.result.AdminPriceRangeResult;
import com.coliving.admin.pricerange.model.AdminPriceRange;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminPriceRangeService implements AdminPriceRangeUseCase {

    private final AdminPriceRangeRepositoryPort adminPriceRangeRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<AdminPriceRangeResult> getPriceRanges() {
        return adminPriceRangeRepositoryPort.findAll().stream()
                .map(AdminPriceRangeResult::from)
                .toList();
    }

    @Override
    public AdminPriceRangeResult createPriceRange(CreatePriceRangeCommand command) {
        AdminPriceRange model = AdminPriceRange.builder()
                .label(command.getLabel())
                .minRent(command.getMinRent())
                .maxRent(command.getMaxRent())
                .isActive(command.getIsActive() != null ? command.getIsActive() : true)
                .build();

        AdminPriceRange saved = adminPriceRangeRepositoryPort.save(model);
        return AdminPriceRangeResult.from(saved);
    }

    @Override
    public AdminPriceRangeResult updatePriceRange(UpdatePriceRangeCommand command) {
        AdminPriceRange existing = adminPriceRangeRepositoryPort.findById(command.getPriceRangePresetId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "가격대 프리셋을 찾을 수 없습니다."));

        AdminPriceRange updated = AdminPriceRange.builder()
                .priceRangePresetId(existing.getPriceRangePresetId())
                .label(command.getLabel())
                .minRent(command.getMinRent())
                .maxRent(command.getMaxRent())
                .isActive(command.getIsActive() != null ? command.getIsActive() : existing.getIsActive())
                .sortOrder(existing.getSortOrder())
                .build();

        AdminPriceRange saved = adminPriceRangeRepositoryPort.save(updated);
        return AdminPriceRangeResult.from(saved);
    }

    @Override
    public void deletePriceRange(Long priceRangePresetId) {
        AdminPriceRange existing = adminPriceRangeRepositoryPort.findById(priceRangePresetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "가격대 프리셋을 찾을 수 없습니다."));

        adminPriceRangeRepositoryPort.delete(priceRangePresetId);
    }

    @Override
    public void updatePriceRangeOrder(List<Long> orderedIds) {
        List<AdminPriceRange> updates = new java.util.ArrayList<>();
        for (int i = 0; i < orderedIds.size(); i++) {
            updates.add(AdminPriceRange.builder()
                    .priceRangePresetId(orderedIds.get(i))
                    .sortOrder(i)
                    .build());
        }
        adminPriceRangeRepositoryPort.updateSortOrders(updates);
    }
}
