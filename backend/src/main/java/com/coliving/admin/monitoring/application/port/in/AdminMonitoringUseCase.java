package com.coliving.admin.monitoring.application.port.in;

import com.coliving.admin.monitoring.adapter.in.web.dto.res.ControlFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceErrorStatsResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceStatusSummaryResponseDto;
import com.coliving.admin.monitoring.application.command.AdminControlLogListCommand;
import com.coliving.admin.monitoring.application.result.AdminControlLogPageResult;

import java.util.List;

public interface AdminMonitoringUseCase {

    /** 기기 상태 요약 (ONLINE/OFFLINE/ERROR 건수) */
    DeviceStatusSummaryResponseDto getDeviceStatusSummary();

    /** ERROR 상태 기기 목록 + 에러 횟수 */
    List<DeviceErrorStatsResponseDto> getDeviceErrorStats();

    /** 기기 종류별 제어 빈도 */
    List<ControlFrequencyResponseDto> getControlFrequencyByDeviceType();

    /** 일별 제어 빈도 (최근 30일) */
    List<ControlFrequencyResponseDto> getDailyControlFrequency();

    /** 관리자 제어 이력 목록 (페이징) */
    AdminControlLogPageResult getControlLogs(AdminControlLogListCommand command);
}
