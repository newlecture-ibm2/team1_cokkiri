package com.coliving.reservation.adapter.out.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 예약 가능한 공용시설 응답 DTO
 *
 * RES-RSV-01: 예약 가능한 공용시설 목록 API 응답에 사용된다.
 * space + common_space_detail + space_image 테이블의 정보를 조합하여 반환한다.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ 포함 정보:                                                       │
 * │ - Space 기본 정보: 이름, 층, 면적, 부대시설, 설명, 상태            │
 * │ - CommonSpaceDetail: 최대수용인원, 운영시간, 이용료               │
 * │ - SpaceImage: 이미지 URL 목록, 썸네일 URL                        │
 * └──────────────────────────────────────────────────────────────────┘
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservableFacilityResponse {

    // ── Space 기본 정보 ──
    private Long spaceId;
    private String name;
    private String status;          // AVAILABLE, OCCUPIED, MAINTENANCE
    private Integer floor;
    private BigDecimal area;
    private String amenities;       // JSONB → String (클라이언트에서 파싱)
    private String description;

    // ── CommonSpaceDetail 정보 ──
    private Integer maxCapacity;    // 최대 수용 인원
    private String operatingHours;  // 운영 시간 (예: "09:00~22:00")
    private Boolean isReservable;   // 예약 필요 여부 (true=예약제, false=자유이용)
    private BigDecimal usageFee;    // 시설 이용료

    // ── SpaceImage 정보 ──
    private String thumbnailUrl;            // 대표 이미지 URL
    private List<ImageInfo> images;         // 전체 이미지 목록

    /**
     * 시설 이미지 정보
     * space_image 테이블의 각 레코드에 대응한다.
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageInfo {
        private Long imageId;
        private String imageUrl;
        private String imageType;   // PHOTO, FLOOR_PLAN
        private Integer sortOrder;
        private Boolean isThumbnail;
    }
}
