package com.coliving.admin.space.adapter.in.web.dto.req;

import com.coliving.user.room.model.SpaceStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@NoArgsConstructor
public class UpdateSpaceRequestDto {

    @NotBlank(message = "공간명은 필수입니다")
    private String name;

    @NotNull(message = "공간 상태는 필수입니다")
    private SpaceStatus status;

    private Integer floor;
    private BigDecimal area;
    private List<String> amenities;
    private String description;

    // Private 상세
    private Long roomTypeId;
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
