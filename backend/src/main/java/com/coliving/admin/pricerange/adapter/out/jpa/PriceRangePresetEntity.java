package com.coliving.admin.pricerange.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "price_range_presets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLDelete(sql = "UPDATE price_range_presets SET deleted_at = CURRENT_TIMESTAMP WHERE price_range_preset_id = ?")
@SQLRestriction("deleted_at IS NULL")
public class PriceRangePresetEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_range_preset_id")
    private Long id;

    @Column(name = "label", length = 50, nullable = false)
    private String label;

    @Column(name = "min_rent", nullable = true)
    private Integer minRent;

    @Column(name = "max_rent", nullable = true)
    private Integer maxRent;

    @org.hibernate.annotations.ColumnDefault("0")
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Builder
    public PriceRangePresetEntity(String label, Integer minRent, Integer maxRent, Integer sortOrder, Boolean isActive) {
        this.label = label;
        this.minRent = minRent;
        this.maxRent = maxRent;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.isActive = isActive != null ? isActive : true;
    }

    public void update(String label, Integer minRent, Integer maxRent, Boolean isActive) {
        this.label = label;
        this.minRent = minRent;
        this.maxRent = maxRent;
        this.isActive = isActive;
    }

    public void updateSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
