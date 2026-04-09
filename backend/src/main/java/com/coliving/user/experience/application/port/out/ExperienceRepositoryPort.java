package com.coliving.user.experience.application.port.out;

import com.coliving.user.experience.model.CommonSpace;

import java.util.List;
import java.util.Optional;

/**
 * 공용시설 조회용 Repository Port (EXPERIENCE 페이지)
 */
public interface ExperienceRepositoryPort {

    /**
     * 전체 공용시설 목록 조회 (점검 중 제외, is_reservable 무관)
     */
    List<CommonSpace> findAllCommonSpaces();

    /**
     * 특정 공용시설 상세 조회
     */
    Optional<CommonSpace> findCommonSpaceById(Long spaceId);
}
