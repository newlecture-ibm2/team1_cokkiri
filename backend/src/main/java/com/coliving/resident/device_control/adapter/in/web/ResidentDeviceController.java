package com.coliving.resident.device_control.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.security.JwtTokenProvider;
import com.coliving.resident.device_control.adapter.in.web.dto.req.ControlDeviceRequestDto;
import com.coliving.resident.device_control.adapter.in.web.dto.res.ControlDeviceResponseDto;
import com.coliving.resident.device_control.adapter.in.web.dto.res.ResidentDeviceResponseDto;
import com.coliving.resident.device_control.application.command.ControlDeviceCommand;
import com.coliving.resident.device_control.application.port.in.ResidentDeviceUseCase;
import com.coliving.resident.device_control.application.result.ControlDeviceResult;
import com.coliving.resident.device_control.model.ResidentDevice;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 입주자 기기 조회 및 제어 (RES-DEV-01, RES-DEV-02)
 * GET  /api/devices/my      — 내 기기 목록
 * POST /api/devices/{id}/control — 기기 제어
 */
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class ResidentDeviceController {

    private final ResidentDeviceUseCase residentDeviceUseCase;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 내 기기 목록 (RES-DEV-01)
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ResidentDeviceResponseDto>>> getMyDevices(
            HttpServletRequest request) {

        Long spaceId = extractSpaceId(request);

        // null 처리 통일: controlDevice와 동일하게 Controller 레벨에서 검증
        if (spaceId == null) {
            throw new BusinessException(ErrorCode.NO_ACTIVE_CONTRACT);
        }

        List<ResidentDevice> devices = residentDeviceUseCase.getMyDevices(spaceId);
        List<ResidentDeviceResponseDto> dtoList = devices.stream()
                .map(ResidentDeviceResponseDto::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(dtoList));
    }

    /**
     * 기기 제어 (RES-DEV-02)
     */
    @PostMapping("/{id}/control")
    public ResponseEntity<ApiResponse<?>> controlDevice(
            @PathVariable Long id,
            @Valid @RequestBody ControlDeviceRequestDto requestDto,
            HttpServletRequest request) {

        String token = resolveToken(request);
        Long userId = jwtTokenProvider.getUserId(token);
        Long spaceId = jwtTokenProvider.getSpaceId(token);

        if (spaceId == null) {
            throw new BusinessException(ErrorCode.NO_ACTIVE_CONTRACT);
        }

        // 요청 추적 ID 추출 (CorrelationIdFilter가 설정한 헤더)
        String correlationId = request.getHeader("X-Correlation-Id");

        ControlDeviceCommand command = new ControlDeviceCommand(
                id, userId, spaceId,
                requestDto.command(), requestDto.params(),
                correlationId
        );

        ControlDeviceResult result = residentDeviceUseCase.controlDevice(command);

        if (!result.success()) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(ErrorCode.IOT_COMMUNICATION_FAIL));
        }

        return ResponseEntity.ok(ApiResponse.ok(
                ControlDeviceResponseDto.from(result), result.message()));
    }

    // ── JWT에서 space_id 추출 ──
    // TODO: [보류] 현재 JWT를 직접 파싱하여 spaceId/userId를 추출하고 있음.
    //  SecurityContext 기반으로 전환하려면 global/security의 JwtTokenProvider.getAuthentication()에서
    //  principal을 CustomUserDetails(userId, spaceId, contractId 포함)로 확장해야 함.
    //  → 공통 인프라(global/security) 영역 수정이 필요하므로 인프라 담당자와 협의 후 전환 예정.

    private Long extractSpaceId(HttpServletRequest request) {
        String token = resolveToken(request);
        return jwtTokenProvider.getSpaceId(token);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new BusinessException(ErrorCode.TOKEN_EXPIRED);
    }
}
