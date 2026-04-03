package com.coliving.reservation.application.service;

import com.coliving.reservation.adapter.out.dto.FacilityDetailResponse;
import com.coliving.reservation.adapter.out.dto.ReservableFacilityResponse;
import com.coliving.reservation.application.port.out.FacilityQueryPort;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 예약 시설 조회 서비스
 *
 * RES-RSV-01: 예약 가능한 공용시설 목록/상세 조회 비즈니스 로직을 담당한다.
 *
 * 읽기 전용 트랜잭션을 사용하여 DB 부하를 최소화한다.
 * 추후 캐싱 적용 시 @Cacheable 어노테이션 추가를 고려할 수 있다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 조회 전용 서비스이므로 readOnly 최적화
public class FacilityQueryService {

    private final FacilityQueryPort facilityQueryPort;

    /**
     * 예약 가능한 공용시설 전체 목록을 조회한다.
     *
     * - 공용 시설(COMMON) 중 is_reservable = true인 시설만 반환
     * - 점검 중(MAINTENANCE) 시설은 제외
     * - 이름순 정렬
     *
     * @return 예약 가능한 공용시설 목록
     */
    public List<ReservableFacilityResponse> getReservableFacilities() {
        log.info("[RES-RSV-01] 예약 가능한 공용시설 목록 조회 요청");

        List<ReservableFacilityResponse> facilities = facilityQueryPort.findAllReservableFacilities();

        log.info("[RES-RSV-01] 조회된 예약 가능 시설 수: {}", facilities.size());
        return facilities;
    }

    /**
     * 특정 공용시설의 상세 정보를 조회한다.
     *
     * - 해당 시설이 존재하지 않거나 공용 시설이 아니면 NOT_FOUND 예외 발생
     * - 오늘 날짜 기준 예약 건수를 함께 반환
     *
     * @param spaceId 시설 ID
     * @return 시설 상세 정보
     * @throws BusinessException 시설을 찾을 수 없는 경우 (NOT_FOUND)
     */
    public FacilityDetailResponse getFacilityDetail(Long spaceId) {
        log.info("[RES-RSV-01] 공용시설 상세 조회 요청 - spaceId: {}", spaceId);

        FacilityDetailResponse detail = facilityQueryPort.findFacilityDetail(spaceId);

        if (detail == null) {
            log.warn("[RES-RSV-01] 시설을 찾을 수 없음 - spaceId: {}", spaceId);
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        return detail;
    }
}
