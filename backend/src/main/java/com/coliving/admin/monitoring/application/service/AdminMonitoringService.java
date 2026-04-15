package com.coliving.admin.monitoring.application.service;

import com.coliving.admin.monitoring.adapter.in.web.dto.res.AdminControlLogResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.ControlFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceAvailabilityResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceErrorStatsResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceStatusSummaryResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.DeviceTypeCommandFrequencyResponseDto;
import com.coliving.admin.monitoring.adapter.in.web.dto.res.SpaceDeviceStatusResponseDto;
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
                        ((Number) row[0]).longValue(),              // deviceId
                        row[1] != null ? row[1].toString() : null,  // deviceName
                        row[2] != null ? row[2].toString() : null,  // deviceTypeCode
                        row[3] != null ? row[3].toString() : null,  // deviceTypeName
                        row[4] != null ? row[4].toString() : null,  // spaceName
                        row[5] != null ? row[5].toString() : null,  // status
                        ((Number) row[6]).longValue(),               // errorCount
                        row[7] != null ? row[7].toString() : null   // lastOnlineAt
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ControlFrequencyResponseDto> getControlFrequencyByDeviceType() {
        return monitoringRepositoryPort.countControlByDeviceType().stream()
                .map(row -> new ControlFrequencyResponseDto(
                        row[0] != null ? row[0].toString() : null,
                        ((Number) row[1]).longValue()
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
                .map(row -> {
                    // 네이티브 쿼리 결과 — JDBC 드라이버 반환 타입이 OffsetDateTime/Timestamp 등
                    // 다양할 수 있으므로 안전하게 변환
                    OffsetDateTime createdAt = null;
                    if (row[13] != null) {
                        if (row[13] instanceof OffsetDateTime odt) {
                            createdAt = odt;
                        } else if (row[13] instanceof java.sql.Timestamp ts) {
                            createdAt = ts.toInstant().atOffset(java.time.ZoneOffset.of("+09:00"));
                        } else if (row[13] instanceof java.time.LocalDateTime ldt) {
                            createdAt = ldt.atOffset(java.time.ZoneOffset.of("+09:00"));
                        } else {
                            createdAt = OffsetDateTime.parse(row[13].toString());
                        }
                    }

                    String cmdCode = row[8] != null ? row[8].toString() : null;
                    String commandsJson = row[14] != null ? row[14].toString() : null;
                    String commandLabel = resolveCommandLabel(commandsJson, cmdCode);

                    return new AdminControlLogResponseDto(
                            ((Number) row[0]).longValue(),                                    // controlLogId
                            ((Number) row[1]).longValue(),                                    // deviceId
                            row[2] != null ? row[2].toString() : null,                        // deviceName
                            row[3] != null ? row[3].toString() : null,                        // deviceTypeName
                            row[4] != null ? row[4].toString() : null,                        // spaceName
                            row[5] != null ? ((Number) row[5]).longValue() : null,             // userId (nullable)
                            row[6] != null ? row[6].toString() : null,                        // userName
                            row[7] != null ? row[7].toString() : null,                        // actorType
                            cmdCode,                                                          // command
                            commandLabel,                                                     // commandLabel
                            row[9] != null ? row[9].toString() : null,                        // commandParams
                            row[10] != null ? row[10].toString() : null,                      // result
                            row[11] != null ? row[11].toString() : null,                      // errorMessage
                            row[12] != null ? row[12].toString() : null,                      // correlationId
                            createdAt                                                         // createdAt
                    );
                })
                .collect(Collectors.toList());

        return new AdminControlLogPageResult(content, command.page(), command.size(), totalElements, totalPages);
    }

    /**
     * device_type.commands JSON에서 해당 command 코드의 label을 찾아 반환.
     * 매칭 실패 시 command 코드를 그대로 반환.
     */
    private String resolveCommandLabel(String commandsJson, String command) {
        if (command == null) return null;
        if (commandsJson == null || commandsJson.isBlank()) return command;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(commandsJson);
            if (root.isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode node : root) {
                    if (node.has("command") && command.equals(node.get("command").asText())) {
                        if (node.has("label") && !node.get("label").asText().isBlank()) {
                            return node.get("label").asText();
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return command;
    }

    @Override
    public List<ControlFrequencyResponseDto> getControlFrequencyBySpaceType() {
        return monitoringRepositoryPort.countControlBySpaceType().stream()
                .map(row -> {
                    String type = row[0] != null ? row[0].toString() : "";
                    String label = "PRIVATE".equals(type) ? "개인 공간" : "공용 공간";
                    return new ControlFrequencyResponseDto(label, ((Number) row[1]).longValue());
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ControlFrequencyResponseDto> getControlFrequencyByCommand() {
        return monitoringRepositoryPort.countControlByCommand().stream()
                .map(row -> new ControlFrequencyResponseDto(
                        row[0] != null ? row[0].toString() : null,
                        ((Number) row[1]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<DeviceTypeCommandFrequencyResponseDto> getControlFrequencyByDeviceTypeAndCommand() {
        return monitoringRepositoryPort.countControlByDeviceTypeAndCommand().stream()
                .map(row -> new DeviceTypeCommandFrequencyResponseDto(
                        row[0] != null ? row[0].toString() : null,
                        row[1] != null ? row[1].toString() : null,
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ControlFrequencyResponseDto> getDailyErrorFrequency() {
        return monitoringRepositoryPort.countDailyErrors().stream()
                .map(row -> new ControlFrequencyResponseDto(
                        row[0].toString(),
                        ((Number) row[1]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<SpaceDeviceStatusResponseDto> getDeviceStatusBySpace() {
        return monitoringRepositoryPort.findDeviceStatusBySpace().stream()
                .map(row -> new SpaceDeviceStatusResponseDto(
                        row[0] != null ? row[0].toString() : null,
                        row[1] != null ? row[1].toString() : null,
                        row[2] != null ? row[2].toString() : null,
                        row[3] != null ? row[3].toString() : null,
                        ((Number) row[4]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<DeviceAvailabilityResponseDto> getDeviceAvailability() {
        return monitoringRepositoryPort.countDeviceAvailability().stream()
                .map(row -> {
                    Integer floor = row[4] != null ? ((Number) row[4]).intValue() : null;
                    long total = ((Number) row[5]).longValue();
                    long success = ((Number) row[6]).longValue();
                    long failure = ((Number) row[7]).longValue();
                    double rate = total > 0 ? Math.round((double) success / total * 1000) / 10.0 : 0;

                    return new DeviceAvailabilityResponseDto(
                            ((Number) row[0]).longValue(),
                            row[1] != null ? row[1].toString() : null,
                            row[2] != null ? row[2].toString() : null,
                            row[3] != null ? row[3].toString() : null,
                            floor,
                            total, success, failure, rate
                    );
                })
                .collect(Collectors.toList());
    }
}
