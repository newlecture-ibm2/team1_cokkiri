package com.coliving.common.auth.adapter.in.web;

import com.coliving.common.auth.adapter.in.web.dto.req.LoginRequestDto;
import com.coliving.common.auth.adapter.in.web.dto.req.RegisterRequestDto;
import com.coliving.common.auth.adapter.in.web.dto.res.LoginResponseDto;
import com.coliving.common.auth.application.command.LoginCommand;
import com.coliving.common.auth.application.command.RegisterCommand;
import com.coliving.common.auth.application.port.in.LoginUseCase;
import com.coliving.common.auth.application.port.in.RegisterUseCase;
import com.coliving.common.auth.application.result.LoginResult;
import com.coliving.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;

    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequestDto request) {
        
        RegisterCommand command = RegisterCommand.builder()
                .loginId(request.getLoginId())
                .password(request.getPassword())
                .passwordConfirm(request.getPasswordConfirm())
                .name(request.getName())
                .birthDate(request.getBirthDate())
                .gender(request.getGender())
                .nationality(request.getNationality())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();
                
        registerUseCase.register(command);
        
        return ApiResponse.ok(null, "회원가입이 완료되었습니다.");
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        
        LoginCommand command = LoginCommand.builder()
                .loginId(request.getLoginId())
                .password(request.getPassword())
                .build();
                
        LoginResult result = loginUseCase.login(command);
        
        LoginResponseDto.User userDto = LoginResponseDto.User.builder()
                .userId(result.getUserId())
                .loginId(result.getLoginId())
                .name(result.getName())
                .role(result.getRole())
                .build();
                
        LoginResponseDto responseDto = LoginResponseDto.builder()
                .accessToken(result.getAccessToken())
                .refreshToken(result.getRefreshToken())
                .user(userDto)
                .build();
                
        return ApiResponse.ok(responseDto, "로그인되었습니다.");
    }
}
