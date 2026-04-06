package com.coliving.admin.space.application.result;

import com.coliving.admin.space.model.AdminSpace;
import com.coliving.user.room.model.ImageType;
import com.coliving.user.room.model.SpaceStatus;
import com.coliving.user.room.model.SpaceType;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AdminSpaceResult {

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

    private PrivateDetail privateDetail;
    private CommonDetail commonDetail;
    private List<SpaceImageResult> images;

    @Getter
    @Builder
    public static class PrivateDetail {
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
    public static class CommonDetail {
        private Integer maxCapacity;
        private String operatingHours;
        private Boolean isReservable;
        private BigDecimal usageFee;
    }

    @Getter
    @Builder
    public static class SpaceImageResult {
        private Long spaceImageId;
        private String imageUrl;
        private ImageType imageType;
        private Integer sortOrder;
        private Boolean isThumbnail;
    }

    public static AdminSpaceResult from(AdminSpace model) {
        AdminSpaceResultBuilder builder = AdminSpaceResult.builder()
                .spaceId(model.getSpaceId())
                .name(model.getName())
                .type(model.getType())
                .status(model.getStatus())
                .floor(model.getFloor())
                .area(model.getArea())
                .amenities(model.getAmenities())
                .description(model.getDescription())
                .positionX(model.getPositionX())
                .positionY(model.getPositionY());

        if (model.getPrivateDetail() != null) {
            builder.privateDetail(PrivateDetail.builder()
                    .roomTypeId(model.getPrivateDetail().getRoomTypeId())
                    .roomTypeName(model.getPrivateDetail().getRoomTypeName())
                    .roomCount(model.getPrivateDetail().getRoomCount())
                    .bathroomCount(model.getPrivateDetail().getBathroomCount())
                    .direction(model.getPrivateDetail().getDirection())
                    .deposit(model.getPrivateDetail().getDeposit())
                    .monthlyRent(model.getPrivateDetail().getMonthlyRent())
                    .maintenanceFee(model.getPrivateDetail().getMaintenanceFee())
                    .parkingAvailable(model.getPrivateDetail().getParkingAvailable())
                    .build());
        }

        if (model.getCommonDetail() != null) {
            builder.commonDetail(CommonDetail.builder()
                    .maxCapacity(model.getCommonDetail().getMaxCapacity())
                    .operatingHours(model.getCommonDetail().getOperatingHours())
                    .isReservable(model.getCommonDetail().getIsReservable())
                    .usageFee(model.getCommonDetail().getUsageFee())
                    .build());
        }

        if (model.getImages() != null) {
            builder.images(model.getImages().stream()
                    .map(img -> SpaceImageResult.builder()
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
