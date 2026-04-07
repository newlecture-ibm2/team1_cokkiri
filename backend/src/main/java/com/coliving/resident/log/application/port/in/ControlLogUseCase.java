package com.coliving.resident.log.application.port.in;

import com.coliving.resident.log.application.command.ControlLogListCommand;
import com.coliving.resident.log.model.ControlLog;
import org.springframework.data.domain.Page;

/**
 * 제어 이력 조회 UseCase (RES-LOG-01)
 */
public interface ControlLogUseCase {

    Page<ControlLog> getMyControlLogs(ControlLogListCommand command);
}
