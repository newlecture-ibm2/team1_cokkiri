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
 *
 * Controller는 JWT에서 userId만 추출하여 UseCase에 전달.
 * ACTIVE 계약의 space_id 조회는 Service 레이어에서 수행. (§1-9 #4 준수)
 */
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class ResidentDeviceController {

    private final ResidentDeviceUseCase residentDeviceUseCase;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 내 기기 목록 (RES-DEV-01)
     * - 다중 계약: Service에서 DB 조회하여 모든 계약 space의 기기 반환
     * - controllable: PRIVATE=항상true, COMMON=현재시각 APPROVED 예약 보유 시 true
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ResidentDeviceResponseDto>>> getMyDevices(
            HttpServletRequest request) {

        String token = resolveToken(request);
        Long userId = jwtTokenProvider.getUserId(token);

        List<ResidentDevice> devices = residentDeviceUseCase.getMyDevices(userId);
        List<ResidentDeviceResponseDto> dtoList = devices.stream()
                .map(d -> {
                    boolean controllable;
                    if ("COMMON".equals(d.spaceType())) {
                        // 자유이용 시설(is_reservable=false): 항상 제어 가능
                        // 예약제 시설(is_reservable=true): APPROVED 예약 시간대만 제어 가능
                        controllable = !Boolean.TRUE.equals(d.isReservable())
                                || residentDeviceUseCase.hasApprovedReservationNow(userId, d.spaceId());
                    } else {
                        controllable = true; // PRIVATE 기기는 항상 제어 가능
                    }
                    return ResidentDeviceResponseDto.from(d, controllable);
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(dtoList));
    }

    /**
     * 기기 제어 (RES-DEV-02)
     * - 다중 계약: Service에서 DB 조회하여 접근 권한 검증
     */
    @PostMapping("/{id}/control")
    public ResponseEntity<ApiResponse<?>> controlDevice(
            @PathVariable Long id,
            @Valid @RequestBody ControlDeviceRequestDto requestDto,
            HttpServletRequest request) {

        String token = resolveToken(request);
        Long userId = jwtTokenProvider.getUserId(token);

        // 요청 추적 ID 추출 (CorrelationIdFilter가 설정한 헤더)
        String correlationId = request.getHeader("X-Correlation-Id");

        ControlDeviceCommand command = new ControlDeviceCommand(
                id, userId,
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

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new BusinessException(ErrorCode.TOKEN_EXPIRED);
    }
}
