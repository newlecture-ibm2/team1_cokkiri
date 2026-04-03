package com.coliving.admin.space.application.command;

import com.coliving.user.room.model.RoomType;
import com.coliving.user.room.model.SpaceStatus;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class UpdateSpaceCommand {

    private Long spaceId;
    private String name;
    private SpaceStatus status;
    private Integer floor;
    private BigDecimal area;
    private List<String> amenities;
    private String description;

    // Private 상세
    private RoomType roomType;
    private Integer roomCount;
    private Integer bathroomCount;
    private String direction;
    private BigDecimal deposit;
    private BigDecimal monthlyRent;
    private BigDecimal maintenanceFee;
    private Boolean parkingAvailable;

    // Common 상세
    private Integer maxCapacity;
    private String operatingHours;
    private Boolean isReservable;
    private BigDecimal usageFee;
}
