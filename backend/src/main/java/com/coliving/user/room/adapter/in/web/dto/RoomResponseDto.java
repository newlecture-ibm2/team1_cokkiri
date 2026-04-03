package com.coliving.user.room.adapter.in.web.dto;

import com.coliving.user.room.model.Room;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class RoomResponseDto {

    private Long spaceId;
    private String name;
    private String status;
    private Integer floor;
    private BigDecimal area;
    private String description;
    private List<String> amenities;

    // Private 상세
    private String roomType;
    private Integer roomCount;
    private Integer bathroomCount;
    private String direction;
    private BigDecimal deposit;
    private BigDecimal monthlyRent;
    private BigDecimal maintenanceFee;
    private Boolean parkingAvailable;

    // 이미지
    private String thumbnailUrl;

    public static RoomResponseDto from(Room room) {
        return RoomResponseDto.builder()
                .spaceId(room.getSpaceId())
                .name(room.getName())
                .status(room.getStatus() != null ? room.getStatus().name() : null)
                .floor(room.getFloor())
                .area(room.getArea())
                .description(room.getDescription())
                .amenities(room.getAmenities())
                .roomType(room.getRoomType() != null ? room.getRoomType().name() : null)
                .roomCount(room.getRoomCount())
                .bathroomCount(room.getBathroomCount())
                .direction(room.getDirection())
                .deposit(room.getDeposit())
                .monthlyRent(room.getMonthlyRent())
                .maintenanceFee(room.getMaintenanceFee())
                .parkingAvailable(room.getParkingAvailable())
                .thumbnailUrl(room.getThumbnailUrl())
                .build();
    }
}
