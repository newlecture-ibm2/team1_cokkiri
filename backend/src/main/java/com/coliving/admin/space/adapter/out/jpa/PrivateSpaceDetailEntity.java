package com.coliving.admin.space.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@Entity
@Table(name = "private_space_details")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLRestriction("deleted_at IS NULL")
public class PrivateSpaceDetailEntity extends BaseEntity {

    @Id
    @Column(name = "space_id")
    private Long spaceId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "space_id")
    private SpaceEntity space;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomTypeEntity roomType;

    @Column(name = "room_count")
    private Integer roomCount;

    @Column(name = "bathroom_count")
    private Integer bathroomCount;

    @Column(name = "direction", length = 20)
    private String direction;

    @Column(name = "deposit", precision = 15, scale = 2)
    private BigDecimal deposit;

    @Column(name = "monthly_rent", precision = 15, scale = 2)
    private BigDecimal monthlyRent;

    @Column(name = "maintenance_fee", precision = 15, scale = 2)
    private BigDecimal maintenanceFee;

    @Column(name = "parking_available")
    private Boolean parkingAvailable;

    @Builder
    public PrivateSpaceDetailEntity(SpaceEntity space, RoomTypeEntity roomType,
                                     Integer roomCount, Integer bathroomCount,
                                     String direction, BigDecimal deposit,
                                     BigDecimal monthlyRent, BigDecimal maintenanceFee,
                                     Boolean parkingAvailable) {
        this.space = space;
        this.roomType = roomType;
        this.roomCount = roomCount;
        this.bathroomCount = bathroomCount;
        this.direction = direction;
        this.deposit = deposit;
        this.monthlyRent = monthlyRent;
        this.maintenanceFee = maintenanceFee;
        this.parkingAvailable = parkingAvailable;
    }

    public void update(RoomTypeEntity roomType, Integer roomCount, Integer bathroomCount,
                       String direction, BigDecimal deposit, BigDecimal monthlyRent,
                       BigDecimal maintenanceFee, Boolean parkingAvailable) {
        this.roomType = roomType;
        this.roomCount = roomCount;
        this.bathroomCount = bathroomCount;
        this.direction = direction;
        this.deposit = deposit;
        this.monthlyRent = monthlyRent;
        this.maintenanceFee = maintenanceFee;
        this.parkingAvailable = parkingAvailable;
    }
}
