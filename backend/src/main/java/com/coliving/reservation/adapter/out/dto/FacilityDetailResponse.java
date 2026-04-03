package com.coliving.reservation.adapter.out.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 예약 가능한 공용시설 상세 조회 응답 DTO
 *
 * RES-RSV-01: 시설 상세 정보 + 해당 시설의 최근 예약 현황을 포함한다.
 * 시설 클릭 시 RSV-4.3 주단위 타임테이블로 연결하기 전 상세 정보를 제공한다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDetailResponse {

    // ── Space 기본 정보 ──
    private Long spaceId;
    private String name;
    private String status;
    private Integer floor;
    private BigDecimal area;
    private String amenities;
    private String description;
    private Integer positionX;
    private Integer positionY;

    // ── CommonSpaceDetail 정보 ──
    private Integer maxCapacity;
    private String operatingHours;
    private BigDecimal usageFee;
    private Boolean isReservable;

    // ── SpaceImage 정보 ──
    private String thumbnailUrl;
    private List<ReservableFacilityResponse.ImageInfo> images;

    // ── 오늘 예약 현황 (간략) ──
    private Integer todayReservationCount;  // 오늘 총 예약 건수
}
