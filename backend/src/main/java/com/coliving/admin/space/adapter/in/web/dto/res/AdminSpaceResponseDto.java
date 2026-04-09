package com.coliving.admin.space.adapter.in.web.dto.res;

import com.coliving.admin.space.application.result.AdminSpaceResult;
import com.coliving.admin.space.model.ImageType;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AdminSpaceResponseDto {

    private Long spaceId;
    private String name;
    private SpaceType type;
    private SpaceStatus status;
    private Integer floor;
    private BigDecimal area;
    private List<String> amenities;
    private String description;
    private Integer positionX;
    private Integer positionY;
    private Integer positionW;
    private Integer positionH;
    private Boolean hasDeviceError;

    private PrivateDetailDto privateDetail;
    private CommonDetailDto commonDetail;
    private List<SpaceImageDto> images;

    @Getter
    @Builder
    public static class PrivateDetailDto {
        private Long roomTypeId;
        private String roomTypeName;
        private Integer roomCount;
        private Integer bathroomCount;
        private String direction;
        private BigDecimal deposit;
        private BigDecimal monthlyRent;
        private BigDecimal maintenanceFee;
        private Boolean parkingAvailable;
    }

    @Getter
    @Builder
    public static class CommonDetailDto {
        private Integer maxCapacity;
        private String operatingHours;
        private Boolean isReservable;
        private BigDecimal usageFee;
    }

    @Getter
    @Builder
    public static class SpaceImageDto {
        private Long spaceImageId;
        private String imageUrl;
        private ImageType imageType;
        private Integer sortOrder;
        private Boolean isThumbnail;
    }

    public static AdminSpaceResponseDto from(AdminSpaceResult result) {
        AdminSpaceResponseDtoBuilder builder = AdminSpaceResponseDto.builder()
                .spaceId(result.getSpaceId())
                .name(result.getName())
                .type(result.getType())
                .status(result.getStatus())
                .floor(result.getFloor())
                .area(result.getArea())
                .amenities(result.getAmenities())
                .description(result.getDescription())
                .positionX(result.getPositionX())
                .positionY(result.getPositionY())
                .positionW(result.getPositionW())
                .positionH(result.getPositionH())
                .hasDeviceError(result.getHasDeviceError());

        if (result.getPrivateDetail() != null) {
            builder.privateDetail(PrivateDetailDto.builder()
                    .roomTypeId(result.getPrivateDetail().getRoomTypeId())
                    .roomTypeName(result.getPrivateDetail().getRoomTypeName())
                    .roomCount(result.getPrivateDetail().getRoomCount())
                    .bathroomCount(result.getPrivateDetail().getBathroomCount())
                    .direction(result.getPrivateDetail().getDirection())
                    .deposit(result.getPrivateDetail().getDeposit())
                    .monthlyRent(result.getPrivateDetail().getMonthlyRent())
                    .maintenanceFee(result.getPrivateDetail().getMaintenanceFee())
                    .parkingAvailable(result.getPrivateDetail().getParkingAvailable())
                    .build());
        }

        if (result.getCommonDetail() != null) {
            builder.commonDetail(CommonDetailDto.builder()
                    .maxCapacity(result.getCommonDetail().getMaxCapacity())
                    .operatingHours(result.getCommonDetail().getOperatingHours())
                    .isReservable(result.getCommonDetail().getIsReservable())
                    .usageFee(result.getCommonDetail().getUsageFee())
                    .build());
        }

        if (result.getImages() != null) {
            builder.images(result.getImages().stream()
                    .map(img -> SpaceImageDto.builder()
                            .spaceImageId(img.getSpaceImageId())
                            .imageUrl(img.getImageUrl())
                            .imageType(img.getImageType())
                            .sortOrder(img.getSortOrder())
                            .isThumbnail(img.getIsThumbnail())
                            .build())
                    .toList());
        }

        return builder.build();
    }
}
