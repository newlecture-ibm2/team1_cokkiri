package com.coliving.user.room.model;

import com.coliving.admin.space.model.ImageType;
import com.coliving.admin.space.model.SpaceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private Long roomTypeId;
    private String roomTypeName;
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

    // OCCUPIED일 때 현재 활성 계약 종료일 (사전 예약용)
    private LocalDate contractEndDate;

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
