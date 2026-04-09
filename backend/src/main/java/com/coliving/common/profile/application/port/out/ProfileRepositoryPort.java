package com.coliving.common.profile.application.port.out;

import com.coliving.common.profile.adapter.in.web.dto.res.ProfileResponseDto;
import java.util.Optional;

public interface ProfileRepositoryPort {
    Optional<ProfileResponseDto> findByUserId(Long userId);
    
    String getPasswordHash(Long userId);
    void updatePassword(Long userId, String newPasswordHash);
}
