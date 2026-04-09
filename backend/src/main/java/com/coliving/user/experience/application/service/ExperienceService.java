package com.coliving.user.experience.application.service;

import com.coliving.user.experience.application.port.in.ExperienceUseCase;
import com.coliving.user.experience.application.port.out.ExperienceRepositoryPort;
import com.coliving.user.experience.model.CommonSpace;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExperienceService implements ExperienceUseCase {

    private final ExperienceRepositoryPort experienceRepositoryPort;

    @Override
    public List<CommonSpace> getAllCommonSpaces() {
        log.info("[EXPERIENCE] 전체 공용시설 목록 조회 요청");

        List<CommonSpace> spaces = experienceRepositoryPort.findAllCommonSpaces();

        log.info("[EXPERIENCE] 조회된 전체 공용시설 수: {}", spaces.size());
        return spaces;
    }

    @Override
    public CommonSpace getCommonSpace(Long spaceId) {
        log.info("[EXPERIENCE] 공용시설 상세 조회 요청: spaceId={}", spaceId);

        return experienceRepositoryPort.findCommonSpaceById(spaceId)
                .orElseThrow(() -> {
                    log.warn("[EXPERIENCE] 공용시설을 찾을 수 없음: spaceId={}", spaceId);
                    return new BusinessException(ErrorCode.NOT_FOUND);
                });
    }
}
