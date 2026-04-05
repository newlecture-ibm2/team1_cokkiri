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
    public ResponseEntity<ApiResponse<ControlDeviceResponseDto>> controlDevice(
            @PathVariable Long id,
            @Valid @RequestBody ControlDeviceRequestDto requestDto,
            HttpServletRequest request) {

        String token = resolveToken(request);
        Long userId = jwtTokenProvider.getUserId(token);
        Long spaceId = jwtTokenProvider.getSpaceId(token);

        if (spaceId == null) {
            throw new BusinessException(ErrorCode.NO_ACTIVE_CONTRACT);
        }

        ControlDeviceCommand command = new ControlDeviceCommand(
                id, userId, spaceId,
                requestDto.command(), requestDto.params()
        );

        ControlDeviceResult result = residentDeviceUseCase.controlDevice(command);
        return ResponseEntity.ok(ApiResponse.ok(
                ControlDeviceResponseDto.from(result), result.message()));
    }

    // ── JWT에서 space_id 추출 ──

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
