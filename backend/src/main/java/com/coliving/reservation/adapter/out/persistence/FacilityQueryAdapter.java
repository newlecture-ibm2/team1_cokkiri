package com.coliving.reservation.adapter.out.persistence;

import com.coliving.reservation.adapter.out.dto.FacilityDetailResponse;
import com.coliving.reservation.adapter.out.dto.ReservableFacilityResponse;
import com.coliving.reservation.application.port.out.FacilityQueryPort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 예약 가능 시설 조회 Adapter 구현체
 *
 * RES-RSV-01: space + common_space_detail + space_image 테이블을 Native Query로
 * 직접 조회하여 FacilityQueryPort를 구현한다.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ [TODO - SPC-2.1 모듈 통합 시 리팩터링]                            │
 * │                                                                  │
 * │ 현재 Native Query를 사용하는 이유:                                │
 * │ - Reservation 모듈이 Space 모듈의 JPA 엔티티에 직접 의존하지 않음  │
 * │ - 모듈 간 결합도를 낮추기 위한 설계                                │
 * │                                                                  │
 * │ 추후 리팩터링 방향:                                               │
 * │ 1. Space 모듈이 공용 API(DTO or Port)를 제공하게 되면             │
 * │    이 Adapter를 해당 API를 호출하는 방식으로 교체                   │
 * │ 2. 또는 SpaceEntity를 공통 모듈로 이동 후 JPQL로 전환             │
 * │                                                                  │
 * │ 관련 담당: Space(정찬우 SPC-2.1)                                  │
 * └──────────────────────────────────────────────────────────────────┘
 */
@Slf4j
@Component
public class FacilityQueryAdapter implements FacilityQueryPort {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * 예약 가능한 공용시설 전체 목록 조회
     *
     * 조회 조건:
     * 1. space.type = 'COMMON'         → 공용 시설만
     * 2. csd.is_reservable = true      → 예약 가능 설정된 시설만
     * 3. space.deleted_at IS NULL      → 삭제되지 않은 시설만
     * 4. space.status != 'MAINTENANCE' → 점검 중인 시설 제외
     *
     * 최적화:
     * - LEFT JOIN으로 이미지를 한 번에 조회하여 N+1 문제 방지
     * - LinkedHashMap으로 시설별 이미지를 그룹핑
     * - 이름순 정렬
     */
    @Override
    public List<ReservableFacilityResponse> findAllReservableFacilities() {
        // Native Query: space + common_space_detail JOIN + space_image LEFT JOIN
        // space_image는 없을 수도 있으므로 LEFT JOIN 사용
        String sql = """
                SELECT s.space_id, s.name, s.status, s.floor, s.area,
                       s.amenities, s.description,
                       csd.max_capacity, csd.operating_hours, csd.is_reservable, csd.usage_fee,
                       si.space_image_id, si.image_url, si.image_type,
                       si.sort_order, si.is_thumbnail
                FROM spaces s
                INNER JOIN common_space_details csd ON s.space_id = csd.space_id
                LEFT JOIN space_images si ON s.space_id = si.space_id
                                         AND si.deleted_at IS NULL
                WHERE s.type = 'COMMON'
                AND csd.is_reservable = true
                AND s.deleted_at IS NULL
                AND s.status != 'MAINTENANCE'
                ORDER BY s.name, si.sort_order
                """;

        Query query = entityManager.createNativeQuery(sql);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        return mapToFacilityResponses(results);
    }

    /**
     * 특정 공용시설 상세 정보 조회
     *
     * 시설 기본 정보 + 이미지 + 오늘 예약 건수를 함께 반환한다.
     * 서브쿼리로 오늘 날짜의 예약 건수를 계산하여 포함시킨다.
     */
    @Override
    public FacilityDetailResponse findFacilityDetail(Long spaceId) {
        // 1. 시설 기본 정보 + 이미지 조회
        String sql = """
                SELECT s.space_id, s.name, s.status, s.floor, s.area,
                       s.amenities, s.description, s.position_x, s.position_y,
                       csd.max_capacity, csd.operating_hours, csd.usage_fee,
                       csd.is_reservable,
                       si.space_image_id, si.image_url, si.image_type,
                       si.sort_order, si.is_thumbnail
                FROM spaces s
                INNER JOIN common_space_details csd ON s.space_id = csd.space_id
                LEFT JOIN space_images si ON s.space_id = si.space_id
                                         AND si.deleted_at IS NULL
                WHERE s.space_id = :spaceId
                AND s.type = 'COMMON'
                AND s.deleted_at IS NULL
                ORDER BY si.sort_order
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("spaceId", spaceId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        if (results.isEmpty()) {
            return null;
        }

        // 2. 오늘 예약 건수 조회
        String countSql = """
                SELECT COUNT(*)
                FROM reservations r
                WHERE r.space_id = :spaceId
                AND r.reservation_date = :today
                AND r.status IN ('PENDING', 'APPROVED')
                AND r.deleted_at IS NULL
                """;

        Query countQuery = entityManager.createNativeQuery(countSql);
        countQuery.setParameter("spaceId", spaceId);
        countQuery.setParameter("today", LocalDate.now());

        Number count = (Number) countQuery.getSingleResult();

        return mapToDetailResponse(results, count.intValue());
    }

    // ── Private 매핑 메서드 ──

    /**
     * Native Query 결과를 ReservableFacilityResponse 목록으로 변환한다.
     *
     * 하나의 시설에 여러 이미지가 있을 수 있으므로, space_id 기준으로 그룹핑한다.
     * LinkedHashMap을 사용하여 이름순 정렬을 유지한다.
     */
    private List<ReservableFacilityResponse> mapToFacilityResponses(List<Object[]> results) {
        // space_id 기준 그룹핑 (이미지가 여러 개일 수 있음)
        Map<Long, ReservableFacilityResponse.ReservableFacilityResponseBuilder> builderMap = new LinkedHashMap<>();
        Map<Long, List<ReservableFacilityResponse.ImageInfo>> imagesMap = new LinkedHashMap<>();
        Map<Long, String> thumbnailMap = new LinkedHashMap<>();

        for (Object[] row : results) {
            Long currentSpaceId = ((Number) row[0]).longValue();

            // 시설 기본 정보 (최초 1회만 세팅)
            // SQL 컬럼 순서: [0]space_id [1]name [2]status [3]floor [4]area
            //               [5]amenities [6]description [7]max_capacity [8]operating_hours
            //               [9]is_reservable [10]usage_fee
            //               [11]space_image_id [12]image_url [13]image_type [14]sort_order [15]is_thumbnail
            if (!builderMap.containsKey(currentSpaceId)) {
                builderMap.put(currentSpaceId, ReservableFacilityResponse.builder()
                        .spaceId(currentSpaceId)
                        .name((String) row[1])
                        .status((String) row[2])
                        .floor(row[3] != null ? ((Number) row[3]).intValue() : null)
                        .area(row[4] != null ? toBigDecimal(row[4]) : null)
                        .amenities(row[5] != null ? row[5].toString() : null)
                        .description((String) row[6])
                        .maxCapacity(row[7] != null ? ((Number) row[7]).intValue() : null)
                        .operatingHours((String) row[8])
                        .isReservable(row[9] != null ? (Boolean) row[9] : false)
                        .usageFee(row[10] != null ? toBigDecimal(row[10]) : null));
                imagesMap.put(currentSpaceId, new ArrayList<>());
            }

            // 이미지 정보 (LEFT JOIN이므로 null일 수 있음) — index 11부터 시작
            if (row[11] != null) {
                ReservableFacilityResponse.ImageInfo imageInfo = ReservableFacilityResponse.ImageInfo.builder()
                        .imageId(((Number) row[11]).longValue())
                        .imageUrl((String) row[12])
                        .imageType((String) row[13])
                        .sortOrder(row[14] != null ? ((Number) row[14]).intValue() : null)
                        .isThumbnail(row[15] != null ? (Boolean) row[15] : false)
                        .build();
                imagesMap.get(currentSpaceId).add(imageInfo);

                // 썸네일 URL 추출
                if (Boolean.TRUE.equals(imageInfo.getIsThumbnail())) {
                    thumbnailMap.put(currentSpaceId, imageInfo.getImageUrl());
                }
            }
        }

        // Builder → Response 변환
        List<ReservableFacilityResponse> responses = new ArrayList<>();
        for (Map.Entry<Long, ReservableFacilityResponse.ReservableFacilityResponseBuilder> entry : builderMap.entrySet()) {
            Long id = entry.getKey();
            List<ReservableFacilityResponse.ImageInfo> images = imagesMap.get(id);

            // 썸네일이 명시적으로 지정되지 않은 경우 첫 번째 이미지를 썸네일로 사용
            String thumbnail = thumbnailMap.getOrDefault(id,
                    images.isEmpty() ? null : images.get(0).getImageUrl());

            responses.add(entry.getValue()
                    .thumbnailUrl(thumbnail)
                    .images(images)
                    .build());
        }

        return responses;
    }

    /**
     * Native Query 결과를 FacilityDetailResponse로 변환한다.
     */
    private FacilityDetailResponse mapToDetailResponse(List<Object[]> results, int todayReservationCount) {
        Object[] firstRow = results.get(0);
        List<ReservableFacilityResponse.ImageInfo> images = new ArrayList<>();
        String thumbnailUrl = null;

        for (Object[] row : results) {
            if (row[13] != null) {  // space_image_id 가 null이 아닌 경우
                ReservableFacilityResponse.ImageInfo imageInfo = ReservableFacilityResponse.ImageInfo.builder()
                        .imageId(((Number) row[13]).longValue())
                        .imageUrl((String) row[14])
                        .imageType((String) row[15])
                        .sortOrder(row[16] != null ? ((Number) row[16]).intValue() : null)
                        .isThumbnail(row[17] != null ? (Boolean) row[17] : false)
                        .build();
                images.add(imageInfo);

                if (Boolean.TRUE.equals(imageInfo.getIsThumbnail())) {
                    thumbnailUrl = imageInfo.getImageUrl();
                }
            }
        }

        // 명시적 썸네일이 없으면 첫 번째 이미지 사용
        if (thumbnailUrl == null && !images.isEmpty()) {
            thumbnailUrl = images.get(0).getImageUrl();
        }

        return FacilityDetailResponse.builder()
                .spaceId(((Number) firstRow[0]).longValue())
                .name((String) firstRow[1])
                .status((String) firstRow[2])
                .floor(firstRow[3] != null ? ((Number) firstRow[3]).intValue() : null)
                .area(firstRow[4] != null ? toBigDecimal(firstRow[4]) : null)
                .amenities(firstRow[5] != null ? firstRow[5].toString() : null)
                .description((String) firstRow[6])
                .positionX(firstRow[7] != null ? ((Number) firstRow[7]).intValue() : null)
                .positionY(firstRow[8] != null ? ((Number) firstRow[8]).intValue() : null)
                .maxCapacity(firstRow[9] != null ? ((Number) firstRow[9]).intValue() : null)
                .operatingHours((String) firstRow[10])
                .usageFee(firstRow[11] != null ? toBigDecimal(firstRow[11]) : null)
                .isReservable(firstRow[12] != null ? (Boolean) firstRow[12] : false)
                .thumbnailUrl(thumbnailUrl)
                .images(images)
                .todayReservationCount(todayReservationCount)
                .build();
    }

    /**
     * DB 결과값을 BigDecimal로 안전하게 변환하는 헬퍼
     * PostgreSQL의 NUMERIC 타입은 BigDecimal 또는 Double 등으로 반환될 수 있다.
     */
    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        } else if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        return null;
    }
}
