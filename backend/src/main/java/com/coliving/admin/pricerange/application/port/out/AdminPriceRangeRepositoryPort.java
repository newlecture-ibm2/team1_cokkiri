package com.coliving.admin.pricerange.application.port.out;

import com.coliving.admin.pricerange.model.AdminPriceRange;

import java.util.List;
import java.util.Optional;

public interface AdminPriceRangeRepositoryPort {
    List<AdminPriceRange> findAll();
    Optional<AdminPriceRange> findById(Long id);
    AdminPriceRange save(AdminPriceRange adminPriceRange);
    void delete(Long id);
    void updateSortOrders(List<AdminPriceRange> updates);
}
