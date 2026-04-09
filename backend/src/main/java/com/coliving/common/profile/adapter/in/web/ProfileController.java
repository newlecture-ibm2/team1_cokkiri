package com.coliving.common.profile.adapter.in.web;

import com.coliving.common.profile.adapter.in.web.dto.res.ProfileResponseDto;
import com.coliving.common.profile.application.port.in.GetProfileUseCase;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.coliving.common.profile.adapter.in.web.dto.req.UpdatePasswordRequestDto;
import com.coliving.common.profile.application.command.UpdatePasswordCommand;
import com.coliving.common.profile.application.port.in.UpdatePasswordUseCase;
import com.coliving.common.auth.application.port.in.LogoutUseCase;
import jakarta.validation.Valid;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me")
public class ProfileController {

    private final GetProfileUseCase getProfileUseCase;
    private final UpdatePasswordUseCase updatePasswordUseCase;
    private final LogoutUseCase logoutUseCase;

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

    @PutMapping("/password")
    public ApiResponse<Void> updatePassword(
            @Valid @RequestBody UpdatePasswordRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        Long userId = Long.parseLong(authentication.getPrincipal().toString());

        UpdatePasswordCommand command = UpdatePasswordCommand.builder()
                .currentPassword(request.getCurrentPassword())
                .newPassword(request.getNewPassword())
                .newPasswordConfirm(request.getNewPasswordConfirm())
                .build();

        updatePasswordUseCase.updatePassword(userId, command);

        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            String accessToken = authorizationHeader.substring(7);
            logoutUseCase.logout(accessToken);
        }

        return ApiResponse.ok(null, "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
    }
}
