package com.coliving.resident.log.application.service;

import com.coliving.resident.log.application.command.ControlLogListCommand;
import com.coliving.resident.log.application.port.in.ControlLogUseCase;
import com.coliving.resident.log.application.port.out.ControlLogRepositoryPort;
import com.coliving.resident.log.model.ControlLog;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * 제어 이력 조회 서비스 (RES-LOG-01)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ControlLogService implements ControlLogUseCase {

    private final ControlLogRepositoryPort controlLogRepositoryPort;

    @Override
    public Page<ControlLog> getMyControlLogs(ControlLogListCommand command) {
        Pageable pageable = PageRequest.of(command.page(), command.size());

        OffsetDateTime startDateTime = command.startDate() != null
                ? command.startDate().atStartOfDay().atZone(ZoneId.of("Asia/Seoul")).toOffsetDateTime()
                : null;

        OffsetDateTime endDateTime = command.endDate() != null
                ? command.endDate().atTime(LocalTime.MAX).atZone(ZoneId.of("Asia/Seoul")).toOffsetDateTime()
                : null;

        return controlLogRepositoryPort.findByFilters(
                command.userId(),
                startDateTime,
                endDateTime,
                command.spaceType(),
                command.deviceTypeCode(),
                command.result(),
                pageable
        );
    }
}
