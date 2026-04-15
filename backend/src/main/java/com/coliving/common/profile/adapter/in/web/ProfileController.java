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
import com.coliving.common.profile.adapter.in.web.dto.req.WithdrawRequestDto;
import com.coliving.common.profile.application.command.UpdatePasswordCommand;
import com.coliving.common.profile.application.command.WithdrawCommand;
import com.coliving.common.profile.application.port.in.UpdatePasswordUseCase;
import com.coliving.common.profile.application.port.in.WithdrawUseCase;
import com.coliving.common.auth.application.port.in.LogoutUseCase;
import jakarta.validation.Valid;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import com.coliving.common.profile.adapter.in.web.dto.req.UpdateProfileRequestDto;
import com.coliving.common.profile.adapter.in.web.dto.req.SendVerificationRequestDto;
import com.coliving.common.profile.adapter.in.web.dto.req.ConfirmVerificationRequestDto;
import com.coliving.common.profile.adapter.in.web.dto.res.VerificationTokenResponseDto;
import com.coliving.common.profile.application.command.UpdateProfileCommand;
import com.coliving.common.profile.application.port.in.EditProfileUseCase;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me")
public class ProfileController {

    private final GetProfileUseCase getProfileUseCase;
    private final UpdatePasswordUseCase updatePasswordUseCase;
    private final EditProfileUseCase editProfileUseCase;
    private final WithdrawUseCase withdrawUseCase;
    private final LogoutUseCase logoutUseCase;

    private Long getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return Long.parseLong(authentication.getPrincipal().toString());
    }

    @PutMapping
    public ApiResponse<Void> updateProfile(@Valid @RequestBody UpdateProfileRequestDto request) {
        Long userId = getUserId();
        
        UpdateProfileCommand command = UpdateProfileCommand.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .birthDate(request.getBirthDate())
                .gender(request.getGender())
                .nationality(request.getNationality())

                .emailVerificationToken(request.getEmailVerificationToken())
                .build();
                
        editProfileUseCase.editProfile(userId, command);
        return ApiResponse.ok(null, "프로필 정보가 성공적으로 수정되었습니다.");
    }


    @PostMapping("/verify/email/send")
    public ApiResponse<Void> sendEmailVerification(@Valid @RequestBody SendVerificationRequestDto request) {
        if (!"EMAIL".equals(request.getType())) throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        editProfileUseCase.sendVerificationCode(getUserId(), request.getContact(), "EMAIL");
        return ApiResponse.ok(null, "인증 번호가 발송되었습니다.");
    }

    @PostMapping("/verify/email/confirm")
    public ApiResponse<VerificationTokenResponseDto> confirmEmailVerification(@Valid @RequestBody ConfirmVerificationRequestDto request) {
        if (!"EMAIL".equals(request.getType())) throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        String token = editProfileUseCase.confirmVerificationCode(getUserId(), request.getContact(), request.getCode(), "EMAIL");
        return ApiResponse.ok(new VerificationTokenResponseDto(token), "이메일 인증이 완료되었습니다.");
    }

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

    @DeleteMapping
    public ApiResponse<Void> withdrawUser(
            @Valid @RequestBody WithdrawRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        Long userId = Long.parseLong(authentication.getPrincipal().toString());

        WithdrawCommand command = WithdrawCommand.builder()
                .password(request.getPassword())
                .build();

        withdrawUseCase.withdraw(userId, command);

        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            String accessToken = authorizationHeader.substring(7);
            logoutUseCase.logout(accessToken);
        }

        return ApiResponse.ok(null, "성공적으로 탈퇴 처리되었습니다. 그동안 이용해주셔서 감사합니다.");
    }
}
