package com.coliving.reservation.application.port.in;

import com.coliving.reservation.adapter.out.dto.FacilityDetailResponse;
import com.coliving.reservation.adapter.out.dto.ReservableFacilityResponse;

import java.util.List;

/**
 * 예약 가능 시설 조회 유스케이스 (Inbound Port)
 *
 * RES-RSV-01: 입주자가 예약 가능한 공용시설 목록 및 상세를 조회하는 UseCase.
 * Controller는 반드시 이 인터페이스를 통해서만 Service에 접근해야 한다.
 */
public interface FacilityQueryUseCase {

    /**
     * 예약 가능한 공용시설 전체 목록을 조회한다.
     *
     * 조건: COMMON 타입 + is_reservable = true + 삭제되지 않음 + 점검 중 아님
     *
     * @return 예약 가능한 공용시설 목록 (이름순 정렬)
     */
    List<ReservableFacilityResponse> getReservableFacilities();

    /**
     * 특정 공용시설의 상세 정보를 조회한다.
     *
     * @param spaceId 시설 ID
     * @return 시설 상세 정보
     * @throws com.coliving.global.error.BusinessException 시설 미존재 시 NOT_FOUND
     */
    FacilityDetailResponse getFacilityDetail(Long spaceId);
}
