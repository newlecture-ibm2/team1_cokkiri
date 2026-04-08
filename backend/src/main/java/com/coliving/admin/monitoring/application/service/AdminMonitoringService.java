package com.coliving.admin.monitoring.application.service;

import com.coliving.admin.monitoring.adapter.in.web.dto.res.AdminControlLogResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.ControlFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceErrorStatsResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceStatusSummaryResponseDto;
import com.coliving.admin.monitoring.application.command.AdminControlLogListCommand;
import com.coliving.admin.monitoring.application.port.in.AdminMonitoringUseCase;
import com.coliving.admin.monitoring.application.port.out.AdminMonitoringRepositoryPort;
import com.coliving.admin.monitoring.application.result.AdminControlLogPageResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMonitoringService implements AdminMonitoringUseCase {

    private final AdminMonitoringRepositoryPort monitoringRepositoryPort;

    @Override
    public DeviceStatusSummaryResponseDto getDeviceStatusSummary() {
        List<Object[]> rows = monitoringRepositoryPort.countDevicesByStatus();
        long online = 0, offline = 0, error = 0;
        for (Object[] row : rows) {
            String status = (String) row[0];
            long count = ((Number) row[1]).longValue();
            switch (status) {
                case "ONLINE" -> online = count;
                case "OFFLINE" -> offline = count;
                case "ERROR" -> error = count;
            }
        }
        return new DeviceStatusSummaryResponseDto(online + offline + error, online, offline, error);
    }

    @Override
    public List<DeviceErrorStatsResponseDto> getDeviceErrorStats() {
        return monitoringRepositoryPort.findDeviceErrorStats().stream()
                .map(row -> new DeviceErrorStatsResponseDto(
                        ((Number) row[0]).longValue(),    // deviceId
                        (String) row[1],                   // deviceName
                        (String) row[2],                   // deviceTypeCode
                        (String) row[3],                   // deviceTypeName
                        (String) row[4],                   // spaceName
                        (String) row[5],                   // status
                        ((Number) row[6]).longValue(),      // errorCount
                        row[7] != null ? row[7].toString() : null  // lastOnlineAt
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ControlFrequencyResponseDto> getControlFrequencyByDeviceType() {
        return monitoringRepositoryPort.countControlByDeviceType().stream()
                .map(row -> new ControlFrequencyResponseDto(
                        (String) row[0],                   // deviceTypeName
                        ((Number) row[1]).longValue()       // count
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ControlFrequencyResponseDto> getDailyControlFrequency() {
        return monitoringRepositoryPort.countDailyControl().stream()
                .map(row -> new ControlFrequencyResponseDto(
                        row[0].toString(),                  // date
                        ((Number) row[1]).longValue()        // count
                ))
                .collect(Collectors.toList());
    }

    @Override
    public AdminControlLogPageResult getControlLogs(AdminControlLogListCommand command) {
        List<Object[]> rows = monitoringRepositoryPort.findControlLogs(command);
        long totalElements = monitoringRepositoryPort.countControlLogs(command);
        int totalPages = (int) Math.ceil((double) totalElements / command.size());

        List<AdminControlLogResponseDto> content = rows.stream()
                .map(row -> new AdminControlLogResponseDto(
                        ((Number) row[0]).longValue(),                       // controlLogId
                        ((Number) row[1]).longValue(),                       // deviceId
                        (String) row[2],                                     // deviceName
                        (String) row[3],                                     // deviceTypeName
                        (String) row[4],                                     // spaceName
                        ((Number) row[5]).longValue(),                       // userId
                        (String) row[6],                                     // userName
                        (String) row[7],                                     // actorType
                        (String) row[8],                                     // command
                        row[9] != null ? row[9].toString() : null,           // commandParams
                        (String) row[10],                                    // result
                        row[11] != null ? (String) row[11] : null,           // errorMessage
                        row[12] != null ? (String) row[12] : null,           // correlationId
                        row[13] != null ? ((OffsetDateTime) row[13]) : null  // createdAt
                ))
                .collect(Collectors.toList());

        return new AdminControlLogPageResult(content, command.page(), command.size(), totalElements, totalPages);
    }
}

