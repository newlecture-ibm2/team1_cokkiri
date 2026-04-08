package com.coliving.common.auth.adapter.in.web;

import com.coliving.common.auth.adapter.in.web.dto.req.RegisterRequestDto;
import com.coliving.common.auth.application.command.RegisterCommand;
import com.coliving.common.auth.application.port.in.RegisterUseCase;
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
}
