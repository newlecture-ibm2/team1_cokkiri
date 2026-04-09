package com.coliving.user.experience.adapter.in.web.dto;

import com.coliving.user.experience.model.CommonSpace;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CommonSpaceResponseDto {

    private Long spaceId;
    private String name;
    private String status;
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
    private List<SpaceImageDto> images;

    @Getter
    @Builder
    public static class SpaceImageDto {
        private Long spaceImageId;
        private String imageUrl;
        private String imageType;
        private Integer sortOrder;
        private Boolean isThumbnail;
    }

    public static CommonSpaceResponseDto from(CommonSpace cs) {
        return CommonSpaceResponseDto.builder()
                .spaceId(cs.getSpaceId())
                .name(cs.getName())
                .status(cs.getStatus() != null ? cs.getStatus().name() : null)
                .floor(cs.getFloor())
                .area(cs.getArea())
                .description(cs.getDescription())
                .amenities(cs.getAmenities())
                .maxCapacity(cs.getMaxCapacity())
                .operatingHours(cs.getOperatingHours())
                .isReservable(cs.getIsReservable())
                .usageFee(cs.getUsageFee())
                .thumbnailUrl(cs.getThumbnailUrl())
                .images(cs.getImages() != null ? cs.getImages().stream()
                        .map(img -> SpaceImageDto.builder()
                                .spaceImageId(img.getSpaceImageId())
                                .imageUrl(img.getImageUrl())
                                .imageType(img.getImageType() != null ? img.getImageType().name() : null)
                                .sortOrder(img.getSortOrder())
                                .isThumbnail(img.getIsThumbnail())
                                .build())
                        .toList() : null)
                .build();
    }
}
