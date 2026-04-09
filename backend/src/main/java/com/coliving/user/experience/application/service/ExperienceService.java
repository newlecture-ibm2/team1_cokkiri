package com.coliving.user.experience.application.service;

import com.coliving.user.experience.application.port.in.ExperienceUseCase;
import com.coliving.user.experience.application.port.out.ExperienceRepositoryPort;
import com.coliving.user.experience.model.CommonSpace;

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
}
