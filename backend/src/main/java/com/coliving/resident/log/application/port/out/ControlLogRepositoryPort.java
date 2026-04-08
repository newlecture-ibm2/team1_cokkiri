package com.coliving.resident.log.application.port.out;

import com.coliving.resident.log.model.ControlLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;

/**
 * 제어 이력 조회용 Repository Port (RES-LOG-01)
 */
public interface ControlLogRepositoryPort {

    Page<ControlLog> findByFilters(
            Long userId,
            OffsetDateTime startDateTime,
            OffsetDateTime endDateTime,
            String spaceType,
            String deviceTypeCode,
            String result,
            Pageable pageable
    );
}
