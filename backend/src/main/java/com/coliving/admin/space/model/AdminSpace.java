package com.coliving.admin.space.model;

import com.coliving.admin.space.model.ImageType;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * 관리자 공간 관리용 도메인 모델 (순수 Java 객체)
 */
@Getter
@Builder
public class AdminSpace {

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
    private Boolean hasDeviceError;

    private PrivateSpaceDetail privateDetail;
    private CommonSpaceDetail commonDetail;
    private List<SpaceImage> images;

    @Getter
    @Builder
    public static class PrivateSpaceDetail {
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
    public static class CommonSpaceDetail {
        private Integer maxCapacity;
        private String operatingHours;
        private Boolean isReservable;
        private BigDecimal usageFee;
    }

    @Getter
    @Builder
    public static class SpaceImage {
        private Long spaceImageId;
        private String imageUrl;
        private ImageType imageType;
        private Integer sortOrder;
        private Boolean isThumbnail;
    }

    public void changeStatus(SpaceStatus status) {
        this.status = status;
    }
}
