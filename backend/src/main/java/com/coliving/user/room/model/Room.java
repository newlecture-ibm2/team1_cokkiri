package com.coliving.user.room.model;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
 * 유저가 보는 방 정보 (PRIVATE 유형 공간 조회용 도메인 모델)
 */
@Getter
@Builder
public class Room {

    private Long spaceId;
    private String name;
    private SpaceStatus status;
    private Integer floor;
    private BigDecimal area;
    private String description;
    private List<String> amenities;

    // Private 상세
    private RoomType roomType;
    private Integer roomCount;
    private Integer bathroomCount;
    private String direction;
    private BigDecimal deposit;
    private BigDecimal monthlyRent;
    private BigDecimal maintenanceFee;
    private Boolean parkingAvailable;

    // 이미지
    private String thumbnailUrl;
    private List<SpaceImage> images;

    @Getter
    @Builder
    public static class SpaceImage {
        private Long spaceImageId;
        private String imageUrl;
        private ImageType imageType;
        private Integer sortOrder;
        private Boolean isThumbnail;
    }
}
