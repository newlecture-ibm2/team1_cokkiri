package com.coliving.user.experience.model;

import com.coliving.admin.space.model.ImageType;
import com.coliving.admin.space.model.SpaceStatus;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
 * 유저가 보는 공용시설 정보 (COMMON 유형 공간 조회용 도메인 모델)
 * EXPERIENCE 소개 페이지에서 사용한다.
 */
@Getter
@Builder
public class CommonSpace {

    private Long spaceId;
    private String name;
    private SpaceStatus status;
    private Integer floor;
    private BigDecimal area;
    private String description;
    private List<String> amenities;

    // Common 상세
    private Integer maxCapacity;
    private String operatingHours;
    private Boolean isReservable;
    private BigDecimal usageFee;

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
