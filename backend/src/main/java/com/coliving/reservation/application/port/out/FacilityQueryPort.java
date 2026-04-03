package com.coliving.reservation.application.port.out;

import com.coliving.reservation.adapter.out.dto.FacilityDetailResponse;
import com.coliving.reservation.adapter.out.dto.ReservableFacilityResponse;

import java.util.List;

/**
 * 예약 가능 시설 조회 Port (Outbound)
 *
 * RES-RSV-01: 예약 모듈에서 공용시설 데이터를 조회하기 위한 Port 인터페이스.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ [설계 의도]                                                      │
 * │                                                                  │
 * │ Reservation 모듈은 Space 모듈의 엔티티에 직접 의존하지 않는다.      │
 * │ 대신 이 Port를 통해 필요한 시설 정보를 조회한다.                    │
 * │ Adapter(구현체)에서 Native Query로 space 테이블을 직접 조회하며,    │
 * │ 추후 SPC-2.1 모듈 통합 시 SpaceEntity를 활용하는 방식으로          │
 * │ Adapter만 교체하면 된다.                                          │
 * │                                                                  │
 * │ 관련 담당: Space(정찬우 SPC-2.1)                                  │
 * └──────────────────────────────────────────────────────────────────┘
 */
public interface FacilityQueryPort {

    /**
     * 예약 가능한 공용시설 전체 목록을 조회한다.
     *
     * 조건:
     * - space.type = 'COMMON' (공용 시설만)
     * - common_space_detail.is_reservable = true (예약 가능한 시설만)
     * - space.deleted_at IS NULL (삭제되지 않은 시설만)
     * - space.status != 'MAINTENANCE' (점검 중인 시설 제외)
     *
     * @return 예약 가능한 공용시설 목록 (이름순 정렬)
     */
    List<ReservableFacilityResponse> findAllReservableFacilities();

    /**
     * 특정 공용시설의 상세 정보를 조회한다.
     *
     * 목록에서 특정 시설을 선택했을 때 상세 정보를 보여주기 위해 사용한다.
     * 오늘 날짜 기준 예약 건수도 함께 반환한다.
     *
     * @param spaceId 시설 ID
     * @return 시설 상세 정보 (없으면 null)
     */
    FacilityDetailResponse findFacilityDetail(Long spaceId);
}
