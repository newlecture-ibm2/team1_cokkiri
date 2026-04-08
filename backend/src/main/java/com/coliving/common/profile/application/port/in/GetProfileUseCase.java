package com.coliving.common.profile.application.port.in;

import com.coliving.common.profile.adapter.in.web.dto.res.ProfileResponseDto;

public interface GetProfileUseCase {
    ProfileResponseDto getProfile(Long userId);
}
