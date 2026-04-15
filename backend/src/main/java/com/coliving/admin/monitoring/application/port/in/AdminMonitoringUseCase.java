package com.coliving.admin.monitoring.application.port.in;

import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceAvailabilityResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.ControlFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceErrorStatsResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceStatusSummaryResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceTypeCommandFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.SpaceDeviceStatusResponseDto;
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

    /** 공간 타입별(PRIVATE/COMMON) 제어 빈도 */
    List<ControlFrequencyResponseDto> getControlFrequencyBySpaceType();

    /** 명령(command)별 제어 빈도 */
    List<ControlFrequencyResponseDto> getControlFrequencyByCommand();

    /** 기기 종류 × 명령 교차 집계 */
    List<DeviceTypeCommandFrequencyResponseDto> getControlFrequencyByDeviceTypeAndCommand();

    /** 일별 에러(FAILURE) 빈도 (최근 30일) */
    List<ControlFrequencyResponseDto> getDailyErrorFrequency();

    /** 공간별 기기 종류·상태 현황 */
    List<SpaceDeviceStatusResponseDto> getDeviceStatusBySpace();

    /** 기기별 제어 성공률 (최근 30일) */
    List<DeviceAvailabilityResponseDto> getDeviceAvailability();
}
