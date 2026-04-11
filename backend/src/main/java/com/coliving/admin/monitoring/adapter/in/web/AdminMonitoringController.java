package com.coliving.admin.monitoring.adapter.in.web;

import com.coliving.admin.monitoring.adapter.in.web.dto.res.ControlFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceErrorStatsResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceStatusSummaryResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceTypeCommandFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.SpaceDeviceStatusResponseDto;
import com.coliving.admin.monitoring.application.command.AdminControlLogListCommand;
import com.coliving.admin.monitoring.application.port.in.AdminMonitoringUseCase;
import com.coliving.admin.monitoring.application.result.AdminControlLogPageResult;
import com.coliving.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "Admin Monitoring", description = "관리자 모니터링 API")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMonitoringController {

    private final AdminMonitoringUseCase monitoringUseCase;

    @Operation(summary = "장애 기기 통계", description = "ERROR 상태 및 에러 이력이 있는 기기 목록과 에러 횟수")
    @GetMapping("/monitoring/errors")
    public ResponseEntity<ApiResponse<List<DeviceErrorStatsResponseDto>>> getDeviceErrors() {
        List<DeviceErrorStatsResponseDto> result = monitoringUseCase.getDeviceErrorStats();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @Operation(summary = "제어 빈도 통계", description = "기기 종류별·공간별·명령별 제어 횟수 + 일별 제어·에러 추이 (최근 30일)")
    @GetMapping("/monitoring/energy")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEnergyStats() {
        DeviceStatusSummaryResponseDto statusSummary = monitoringUseCase.getDeviceStatusSummary();
        List<ControlFrequencyResponseDto> byType = monitoringUseCase.getControlFrequencyByDeviceType();
        List<ControlFrequencyResponseDto> daily = monitoringUseCase.getDailyControlFrequency();
        List<ControlFrequencyResponseDto> bySpaceType = monitoringUseCase.getControlFrequencyBySpaceType();
        List<ControlFrequencyResponseDto> byCommand = monitoringUseCase.getControlFrequencyByCommand();
        List<DeviceTypeCommandFrequencyResponseDto> byTypeAndCommand = monitoringUseCase.getControlFrequencyByDeviceTypeAndCommand();
        List<ControlFrequencyResponseDto> dailyErrors = monitoringUseCase.getDailyErrorFrequency();

        var deviceStatusBySpace = monitoringUseCase.getDeviceStatusBySpace();

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("statusSummary", statusSummary);
        data.put("frequencyByType", byType);
        data.put("dailyFrequency", daily);
        data.put("frequencyBySpaceType", bySpaceType);
        data.put("frequencyByCommand", byCommand);
        data.put("frequencyByDeviceTypeAndCommand", byTypeAndCommand);
        data.put("dailyErrorFrequency", dailyErrors);
        data.put("deviceStatusBySpace", deviceStatusBySpace);

        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(summary = "제어 이력 목록", description = "전체 기기 제어 이력 (페이징, 필터)")
    @GetMapping("/control-logs")
    public ResponseEntity<ApiResponse<AdminControlLogPageResult>> getControlLogs(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long spaceId,
            @RequestParam(required = false) Long deviceTypeId,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int p,
            @RequestParam(defaultValue = "20") int s
    ) {
        AdminControlLogListCommand command = new AdminControlLogListCommand(
                deviceId, userId, spaceId, deviceTypeId, result, startDate, endDate, p, s
        );
        AdminControlLogPageResult pageResult = monitoringUseCase.getControlLogs(command);
        return ResponseEntity.ok(ApiResponse.ok(pageResult));
    }
}

