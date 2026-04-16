package com.coliving.admin.pricerange.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceRangePresetJpaRepository extends JpaRepository<PriceRangePresetEntity, Long> {
    List<PriceRangePresetEntity> findAllByOrderBySortOrderAsc();
    List<PriceRangePresetEntity> findAllByIsActiveTrueOrderBySortOrderAsc();
}
