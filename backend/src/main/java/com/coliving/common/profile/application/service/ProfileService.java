package com.coliving.common.profile.application.service;

import com.coliving.common.profile.adapter.in.web.dto.res.ProfileResponseDto;
import com.coliving.common.profile.application.port.in.GetProfileUseCase;
import com.coliving.common.profile.application.port.out.ProfileRepositoryPort;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService implements GetProfileUseCase {

    private final ProfileRepositoryPort profileRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponseDto getProfile(Long userId) {
        return profileRepositoryPort.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
    }
}
