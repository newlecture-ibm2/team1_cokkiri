package com.coliving.admin.space.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.SQLDelete;

import java.math.BigDecimal;

@Entity
@Table(name = "common_space_details")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLDelete(sql = "UPDATE common_space_details SET deleted_at = CURRENT_TIMESTAMP WHERE space_id = ?")
@SQLRestriction("deleted_at IS NULL")
public class CommonSpaceDetailEntity extends BaseEntity {

    @Id
    @Column(name = "space_id")
    private Long spaceId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "space_id")
    private SpaceEntity space;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "operating_hours", length = 50)
    private String operatingHours;

    @Column(name = "is_reservable")
    private Boolean isReservable;

    @Column(name = "usage_fee", precision = 15, scale = 2)
    private BigDecimal usageFee;

    @Builder
    public CommonSpaceDetailEntity(SpaceEntity space, Integer maxCapacity,
                                    String operatingHours, Boolean isReservable,
                                    BigDecimal usageFee) {
        this.space = space;
        this.maxCapacity = maxCapacity;
        this.operatingHours = operatingHours;
        this.isReservable = isReservable;
        this.usageFee = usageFee;
    }

    public void update(Integer maxCapacity, String operatingHours,
                       Boolean isReservable, BigDecimal usageFee) {
        this.maxCapacity = maxCapacity;
        this.operatingHours = operatingHours;
        this.isReservable = isReservable;
        this.usageFee = usageFee;
    }
}
