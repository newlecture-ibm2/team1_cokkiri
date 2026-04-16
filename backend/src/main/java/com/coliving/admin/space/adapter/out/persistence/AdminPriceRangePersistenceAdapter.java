package com.coliving.admin.space.adapter.out.persistence;

import com.coliving.admin.space.adapter.out.jpa.PriceRangePresetEntity;
import com.coliving.admin.space.adapter.out.jpa.PriceRangePresetJpaRepository;
import com.coliving.admin.space.application.port.out.AdminPriceRangeRepositoryPort;
import com.coliving.admin.space.model.AdminPriceRange;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminPriceRangePersistenceAdapter implements AdminPriceRangeRepositoryPort {

    private final PriceRangePresetJpaRepository jpaRepository;

    @Override
    public List<AdminPriceRange> findAll() {
        return jpaRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toModel)
                .toList();
    }

    @Override
    public Optional<AdminPriceRange> findById(Long id) {
        return jpaRepository.findById(id).map(this::toModel);
    }

    @Override
    public AdminPriceRange save(AdminPriceRange model) {
        PriceRangePresetEntity entity;
        if (model.getPriceRangePresetId() == null) {
            entity = PriceRangePresetEntity.builder()
                    .label(model.getLabel())
                    .minRent(model.getMinRent())
                    .maxRent(model.getMaxRent())
                    .sortOrder(model.getSortOrder())
                    .isActive(model.getIsActive())
                    .build();
        } else {
            entity = jpaRepository.findById(model.getPriceRangePresetId())
                    .orElseThrow(() -> new IllegalArgumentException("Not found: " + model.getPriceRangePresetId()));
            entity.update(model.getLabel(), model.getMinRent(), model.getMaxRent(), model.getIsActive());
        }
        
        return toModel(jpaRepository.save(entity));
    }

    @Override
    public void delete(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void updateSortOrders(List<AdminPriceRange> updates) {
        for (AdminPriceRange update : updates) {
            jpaRepository.findById(update.getPriceRangePresetId()).ifPresent(entity -> {
                entity.updateSortOrder(update.getSortOrder());
                jpaRepository.save(entity);
            });
        }
    }

    private AdminPriceRange toModel(PriceRangePresetEntity entity) {
        return AdminPriceRange.builder()
                .priceRangePresetId(entity.getId())
                .label(entity.getLabel())
                .minRent(entity.getMinRent())
                .maxRent(entity.getMaxRent())
                .sortOrder(entity.getSortOrder())
                .isActive(entity.getIsActive())
                .build();
    }
}
