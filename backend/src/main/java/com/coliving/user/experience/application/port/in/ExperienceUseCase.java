package com.coliving.user.experience.application.port.in;

import com.coliving.user.experience.model.CommonSpace;

import java.util.List;

/**
 * 공용시설 소개 조회 유스케이스 (EXPERIENCE 페이지용)
 *
 * 예약 가능 여부와 무관하게 모든 COMMON 공간을 조회한다.
 */
public interface ExperienceUseCase {

    /**
     * 전체 공용시설 목록 조회 (점검 중 제외)
     */
    List<CommonSpace> getAllCommonSpaces();

    /**
     * 특정 공용시설 상세 조회
     */
    CommonSpace getCommonSpace(Long spaceId);
}
