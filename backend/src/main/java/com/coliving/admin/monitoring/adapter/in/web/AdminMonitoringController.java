package com.coliving.admin.monitoring.adapter.in.web;

import com.coliving.admin.monitoring.adapter.in.web.dto.res.ControlFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceErrorStatsResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceStatusSummaryResponseDto;
import com.coliving.admin.monitoring.application.port.in.AdminMonitoringUseCase;
import com.coliving.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Admin Monitoring", description = "관리자 모니터링 API")
@RestController
@RequestMapping("/api/admin/monitoring")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMonitoringController {

    private final AdminMonitoringUseCase monitoringUseCase;

    @Operation(summary = "장애 기기 통계", description = "ERROR 상태 및 에러 이력이 있는 기기 목록과 에러 횟수")
    @GetMapping("/errors")
    public ResponseEntity<ApiResponse<List<DeviceErrorStatsResponseDto>>> getDeviceErrors() {
        List<DeviceErrorStatsResponseDto> result = monitoringUseCase.getDeviceErrorStats();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @Operation(summary = "제어 빈도 통계", description = "기기 종류별 제어 횟수 + 일별 제어 추이 (최근 30일)")
    @GetMapping("/energy")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEnergyStats() {
        DeviceStatusSummaryResponseDto statusSummary = monitoringUseCase.getDeviceStatusSummary();
        List<ControlFrequencyResponseDto> byType = monitoringUseCase.getControlFrequencyByDeviceType();
        List<ControlFrequencyResponseDto> daily = monitoringUseCase.getDailyControlFrequency();

        Map<String, Object> data = Map.of(
                "statusSummary", statusSummary,
                "frequencyByType", byType,
                "dailyFrequency", daily
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
