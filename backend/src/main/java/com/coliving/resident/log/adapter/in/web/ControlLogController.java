package com.coliving.resident.log.adapter.in.web;

import com.coliving.admin.device.adapter.out.jpa.DeviceTypeJpaRepository;
import com.coliving.global.dto.ApiResponse;
import com.coliving.resident.log.adapter.in.web.dto.ControlLogResponseDto;
import com.coliving.resident.log.adapter.out.jpa.ControlLogJpaRepository;
import com.coliving.resident.log.adapter.out.jpa.ControlResult;
import com.coliving.resident.log.application.command.ControlLogListCommand;
import com.coliving.resident.log.application.port.in.ControlLogUseCase;
import com.coliving.resident.log.model.ControlLog;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 제어 이력 조회 API (RES-LOG-01)
 * GET /api/control-logs/my
 * GET /api/control-logs/device-types (필터용 기기 종류 목록)
 * 역할: RESIDENT, ADMIN
 */
@RestController
@RequestMapping("/api/control-logs")
@RequiredArgsConstructor
public class ControlLogController {

    private final ControlLogUseCase controlLogUseCase;
    private final DeviceTypeJpaRepository deviceTypeJpaRepository;
    private final ControlLogJpaRepository controlLogJpaRepository;

    @GetMapping("/my")
    public ApiResponse<Map<String, Object>> getMyControlLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String spaceType,
            @RequestParam(required = false) String deviceTypeCode,
            @RequestParam(required = false) String result,
            @RequestParam(defaultValue = "0") int p,
            @RequestParam(defaultValue = "20") int s
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(auth.getName());

        ControlLogListCommand command = new ControlLogListCommand(
                userId, startDate, endDate, spaceType, deviceTypeCode, result, p, s
        );

        Page<ControlLog> page = controlLogUseCase.getMyControlLogs(command);

        List<ControlLogResponseDto> content = page.getContent().stream()
                .filter(log -> log != null)
                .map(ControlLogResponseDto::from)
                .toList();

        // 전체 성공/실패 건수 (필터 무관, 해당 유저의 전체 이력 기준)
        long successCount = controlLogJpaRepository.countByUserIdAndResult(userId, ControlResult.SUCCESS);
        long failureCount = controlLogJpaRepository.countByUserIdAndResult(userId, ControlResult.FAILURE);

        Map<String, Object> data = new HashMap<>();
        data.put("content", content);
        data.put("page", page.getNumber());
        data.put("size", page.getSize());
        data.put("totalElements", page.getTotalElements());
        data.put("totalPages", page.getTotalPages());
        data.put("successCount", successCount);
        data.put("failureCount", failureCount);

        return ApiResponse.ok(data);
    }

    /**
     * 필터 드롭다운용 기기 종류 목록 (READ 전용 — domain collaboration §1 허용)
     */
    @GetMapping("/device-types")
    public ApiResponse<List<Map<String, String>>> getDeviceTypes() {
        List<Map<String, String>> types = deviceTypeJpaRepository.findAll().stream()
                .map(dt -> Map.of("code", dt.getCode(), "name", dt.getName()))
                .toList();
        return ApiResponse.ok(types);
    }
}
