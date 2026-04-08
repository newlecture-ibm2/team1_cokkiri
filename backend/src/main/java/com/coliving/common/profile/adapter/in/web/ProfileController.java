package com.coliving.common.profile.adapter.in.web;

import com.coliving.common.profile.adapter.in.web.dto.res.ProfileResponseDto;
import com.coliving.common.profile.application.port.in.GetProfileUseCase;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me")
public class ProfileController {

    private final GetProfileUseCase getProfileUseCase;

    @GetMapping
    public ApiResponse<ProfileResponseDto> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        // JwtTokenProvider.getAuthentication()에서 principal로 claims.getSubject() (userId 문자열)을 넣음
        Long userId = Long.parseLong(authentication.getPrincipal().toString());

        ProfileResponseDto profile = getProfileUseCase.getProfile(userId);
        return ApiResponse.ok(profile);
    }
}
