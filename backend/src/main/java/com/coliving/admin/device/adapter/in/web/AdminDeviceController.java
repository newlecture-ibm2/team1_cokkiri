package com.coliving.admin.device.adapter.in.web;

import com.coliving.admin.device.adapter.in.web.dto.req.ControlAdminDeviceRequestDto;
import com.coliving.admin.device.adapter.in.web.dto.req.CreateAdminDeviceRequestDto;
import com.coliving.admin.device.adapter.in.web.dto.req.UpdateAdminDeviceActiveRequestDto;
import com.coliving.admin.device.adapter.in.web.dto.req.UpdateAdminDeviceRequestDto;
import com.coliving.admin.device.adapter.in.web.dto.res.AdminDeviceResponseDto;
import com.coliving.admin.device.adapter.in.web.dto.res.ControlAdminDeviceResponseDto;
import com.coliving.admin.device.adapter.in.web.dto.res.CreateAdminDeviceResponseDto;
import com.coliving.admin.device.application.command.AdminDeviceListCommand;
import com.coliving.admin.device.application.command.ControlAdminDeviceCommand;
import com.coliving.admin.device.application.command.DeleteAdminDeviceCommand;
import com.coliving.admin.device.application.port.in.AdminDeviceUseCase;
import com.coliving.admin.device.application.port.in.CreateAdminDeviceUseCase;
import com.coliving.admin.device.application.result.ControlAdminDeviceResult;
import com.coliving.admin.device.application.result.CreateAdminDeviceResult;
import com.coliving.admin.device.model.AdminDevice;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/devices")
@RequiredArgsConstructor
public class AdminDeviceController {

    private final CreateAdminDeviceUseCase createAdminDeviceUseCase;
    private final AdminDeviceUseCase adminDeviceUseCase;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 기기 목록 조회 (ADM-DEV-01)
     * GET /api/admin/devices?spaceId=&deviceTypeId=&status=&isActive=&p=0&s=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeviceList(
            @RequestParam(required = false) Long spaceId,
            @RequestParam(required = false) Long deviceTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int p,
            @RequestParam(defaultValue = "20") int s
    ) {
        AdminDeviceListCommand command = new AdminDeviceListCommand(
                spaceId, deviceTypeId, status, isActive, p, s
        );
        List<AdminDevice> allFiltered = adminDeviceUseCase.getDeviceList(command);
        long totalElements = allFiltered.size();
        int totalPages = (int) Math.ceil((double) totalElements / s);

        List<AdminDeviceResponseDto> content = allFiltered.stream()
                .skip((long) p * s)
                .limit(s)
                .map(AdminDeviceResponseDto::from)
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("page", p);
        result.put("size", s);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * 기기 등록 (ADM-DEV-02)
     * POST /api/admin/devices
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CreateAdminDeviceResponseDto>> createDevice(
            @Valid @RequestBody CreateAdminDeviceRequestDto requestDto) {

        CreateAdminDeviceResult result = createAdminDeviceUseCase.execute(requestDto.toCommand());
        CreateAdminDeviceResponseDto responseDto = CreateAdminDeviceResponseDto.from(result);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDto, "기기가 등록되었습니다"));
    }

    /**
     * 기기 수정 (ADM-DEV-05)
     * PUT /api/admin/devices/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminDeviceResponseDto>> updateDevice(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminDeviceRequestDto requestDto) {

        AdminDevice updated = adminDeviceUseCase.updateDevice(requestDto.toCommand(id));
        return ResponseEntity.ok(ApiResponse.ok(
                AdminDeviceResponseDto.from(updated), "기기 정보가 수정되었습니다"));
    }

    /**
     * 기기 활성/비활성 토글 (ADM-DEV-03)
     * PATCH /api/admin/devices/{id}/active
     */
    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<AdminDeviceResponseDto>> updateActive(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminDeviceActiveRequestDto requestDto) {

        AdminDevice updated = adminDeviceUseCase.updateActive(requestDto.toCommand(id));
        return ResponseEntity.ok(ApiResponse.ok(AdminDeviceResponseDto.from(updated),
                updated.isActive() ? "기기가 활성화되었습니다" : "기기가 비활성화되었습니다"));
    }

    // 기기 상태(ONLINE/OFFLINE/ERROR)는 자동 관리:
    // - 활성/비활성 토글 → ONLINE/OFFLINE 자동 전환 (ADM-DEV-03)
    // - IoT 통신 실패 → ERROR 자동 전환
    // 관리자 수동 상태변경 API는 제거됨

    /**
     * 기기 삭제 — Soft Delete (ADM-DEV-06)
     * DELETE /api/admin/devices/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDevice(@PathVariable Long id) {
        adminDeviceUseCase.deleteDevice(new DeleteAdminDeviceCommand(id));
        return ResponseEntity.ok(ApiResponse.ok(null, "기기가 삭제되었습니다"));
    }

    /**
     * 기기 제어 (ADM-DEV-04)
     * POST /api/admin/devices/{id}/control
     * ADMIN은 space_id 제한 없이 전체 접근
     */
    @PostMapping("/{id}/control")
    public ResponseEntity<ApiResponse<ControlAdminDeviceResponseDto>> controlDevice(
            @PathVariable Long id,
            @Valid @RequestBody ControlAdminDeviceRequestDto requestDto,
            HttpServletRequest request) {

        String token = resolveToken(request);
        Long userId = jwtTokenProvider.getUserId(token);
        String correlationId = request.getHeader("X-Correlation-Id");

        ControlAdminDeviceCommand command = new ControlAdminDeviceCommand(
                id, userId,
                requestDto.command(), requestDto.params(),
                correlationId
        );

        ControlAdminDeviceResult result = adminDeviceUseCase.controlDevice(command);
        return ResponseEntity.ok(ApiResponse.ok(
                ControlAdminDeviceResponseDto.from(result), result.message()));
    }

    // ── JWT 토큰 추출 ──

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new BusinessException(ErrorCode.TOKEN_EXPIRED);
    }
}
