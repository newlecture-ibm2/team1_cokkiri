package com.coliving.reservation.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.reservation.adapter.out.dto.FacilityDetailResponse;
import com.coliving.reservation.adapter.out.dto.ReservableFacilityResponse;
import com.coliving.reservation.application.port.in.FacilityQueryUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 예약 시설 조회 REST Controller
 *
 * RES-RSV-01: 예약 가능한 공용시설 목록 및 상세 조회 API를 제공한다.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ API 엔드포인트 목록                                               │
 * │                                                                  │
 * │ GET /api/facilities           → 예약 가능 공용시설 목록 조회       │
 * │ GET /api/facilities/{id}      → 공용시설 상세 조회                │
 * │                                                                  │
 * │ 접근 권한: RESIDENT, ADMIN (SecurityConfig 참조)                  │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * @see com.coliving.global.config.SecurityConfig
 *      → /api/facilities/** 는 RESIDENT, ADMIN 역할만 접근 가능
 */
@Tag(name = "Facility", description = "예약 가능 공용시설 조회 API (RES-RSV-01)")
@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityQueryUseCase facilityQueryUseCase;

    /**
     * 예약 가능한 공용시설 전체 목록 조회
     *
     * 공용 시설 중 예약 가능(is_reservable = true)하고,
     * 점검 중(MAINTENANCE)이 아닌 시설 목록을 반환한다.
     * 각 시설의 기본 정보, 이용료, 운영시간, 이미지 등을 포함한다.
     *
     * @return 예약 가능한 공용시설 목록
     */
    @Operation(
            summary = "예약 가능 공용시설 목록 조회",
            description = "공용 시설 중 예약 가능하고 점검 중이 아닌 시설을 이름순으로 조회합니다. "
                        + "각 시설의 기본 정보, 운영시간, 이용료, 이미지 등을 포함합니다."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservableFacilityResponse>>> getReservableFacilities() {
        List<ReservableFacilityResponse> facilities = facilityQueryUseCase.getReservableFacilities();
        return ResponseEntity.ok(ApiResponse.ok(facilities));
    }

    /**
     * 특정 공용시설의 상세 정보 조회
     *
     * 시설 기본 정보에 더해 위치 좌표(positionX/Y), 오늘 예약 건수 등
     * 목록에서 생략된 상세 정보를 추가로 반환한다.
     *
     * @param spaceId 시설 ID (path variable)
     * @return 시설 상세 정보
     */
    @Operation(
            summary = "공용시설 상세 조회",
            description = "특정 공용시설의 상세 정보를 조회합니다. "
                        + "위치 좌표, 오늘 예약 건수 등 추가 정보를 포함합니다."
    )
    @GetMapping("/{spaceId}")
    public ResponseEntity<ApiResponse<FacilityDetailResponse>> getFacilityDetail(
            @Parameter(description = "공용시설 ID", example = "1")
            @PathVariable Long spaceId) {
        FacilityDetailResponse detail = facilityQueryUseCase.getFacilityDetail(spaceId);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }
}
