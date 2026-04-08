package com.coliving.admin.device.adapter.out.persistence;

import com.coliving.admin.device.adapter.out.jpa.*;
import com.coliving.admin.device.application.command.AdminDeviceListCommand;
import com.coliving.admin.device.application.port.out.AdminDeviceRepositoryPort;
import com.coliving.admin.device.model.AdminDevice;
import com.coliving.admin.device.model.DeviceStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.resident.log.adapter.out.jpa.ActorType;
import com.coliving.resident.log.adapter.out.jpa.ControlLogEntity;
import com.coliving.resident.log.adapter.out.jpa.ControlLogJpaRepository;
import com.coliving.resident.log.adapter.out.jpa.ControlResult;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminDevicePersistenceAdapter implements AdminDeviceRepositoryPort {

    private final DeviceJpaRepository deviceJpaRepository;
    private final DeviceTypeJpaRepository deviceTypeJpaRepository;
    private final ControlLogJpaRepository controlLogJpaRepository;
    private final jakarta.persistence.EntityManager entityManager;
    private final ObjectMapper objectMapper;

    @Override
    public AdminDevice save(AdminDevice device) {
        DeviceTypeEntity deviceType = deviceTypeJpaRepository.findById(device.deviceTypeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기 종류를 찾을 수 없습니다"));

        DeviceEntity entity;

        if (device.deviceId() != null) {
            entity = deviceJpaRepository.findById(device.deviceId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));
            entity.update(
                    device.name(),
                    device.modelName(),
                    device.macAddress(),
                    device.mockEndpoint(),
                    device.spaceId(),
                    deviceType
            );
        } else {
            entity = DeviceEntity.builder()
                    .spaceId(device.spaceId())
                    .deviceType(deviceType)
                    .name(device.name())
                    .modelName(device.modelName())
                    .macAddress(device.macAddress())
                    .mockEndpoint(device.mockEndpoint())
                    .status(DeviceStatus.OFFLINE)
                    .currentState("{}")
                    .isActive(true)
                    .installedAt(OffsetDateTime.now())
                    .build();
        }

        DeviceEntity saved = deviceJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    public Optional<AdminDevice> findById(Long deviceId) {
        return deviceJpaRepository.findById(deviceId).map(this::toModel);
    }

    @Override
    public boolean existsByMacAddress(String macAddress) {
        return deviceJpaRepository.existsByMacAddress(macAddress);
    }

    @Override
    public boolean existsByMacAddressAndDeviceIdNot(String macAddress, Long deviceId) {
        return deviceJpaRepository.existsByMacAddressAndDeviceIdNot(macAddress, deviceId);
    }

    @Override
    public List<AdminDevice> findAll() {
        return deviceJpaRepository.findAll().stream()
                .map(this::toModel)
                .toList();
    }

    @Override
    public List<AdminDevice> findAll(AdminDeviceListCommand command) {
        StringBuilder sql = new StringBuilder("""
                SELECT d.device_id, d.space_id, dt.device_type_id, dt.code, dt.name AS dt_name,
                       d.name, d.model_name, d.mac_address, d.mock_endpoint,
                       d.status, d.current_state, d.is_active, d.installed_at,
                       d.last_online_at, d.created_at, d.updated_at
                FROM devices d
                JOIN device_types dt ON d.device_type_id = dt.device_type_id
                WHERE d.deleted_at IS NULL
                """);

        appendDeviceFilters(sql, command);
        sql.append(" ORDER BY d.created_at DESC");
        sql.append(" LIMIT :limit OFFSET :offset");

        var query = entityManager.createNativeQuery(sql.toString());
        bindDeviceFilterParams(query, command);
        query.setParameter("limit", command.size());
        query.setParameter("offset", command.page() * command.size());

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(this::toModelFromRow).toList();
    }

    @Override
    public long count(AdminDeviceListCommand command) {
        StringBuilder sql = new StringBuilder("""
                SELECT COUNT(*)
                FROM devices d
                WHERE d.deleted_at IS NULL
                """);

        appendDeviceFilters(sql, command);

        var query = entityManager.createNativeQuery(sql.toString());
        bindDeviceFilterParams(query, command);

        return ((Number) query.getSingleResult()).longValue();
    }

    @Override
    public void updateActive(Long deviceId, boolean isActive) {
        DeviceEntity entity = deviceJpaRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));
        entity.updateActive(isActive);
        deviceJpaRepository.save(entity);
    }

    @Override
    public void updateStatus(Long deviceId, String status) {
        DeviceEntity entity = deviceJpaRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));
        entity.updateStatus(DeviceStatus.valueOf(status));
        deviceJpaRepository.save(entity);
    }

    @Override
    public AdminDevice updateDevice(Long deviceId, String name, Long spaceId,
                                    String modelName, String macAddress, String mockEndpoint) {
        DeviceEntity entity = deviceJpaRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));
        entity.updateWithoutType(name, modelName, macAddress, mockEndpoint, spaceId);
        DeviceEntity saved = deviceJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    public void softDelete(Long deviceId) {
        DeviceEntity entity = deviceJpaRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기를 찾을 수 없습니다"));
        entity.softDelete();
        deviceJpaRepository.save(entity);
    }

    @Override
    public boolean hasControlLogs(Long deviceId) {
        return deviceJpaRepository.existsControlLogsByDeviceId(deviceId);
    }

    @Override
    public String findSpaceTypeById(Long spaceId) {
        var resultList = entityManager
                .createNativeQuery("SELECT s.type FROM spaces s WHERE s.space_id = :spaceId AND s.deleted_at IS NULL")
                .setParameter("spaceId", spaceId)
                .getResultList();
        if (resultList.isEmpty()) {
            return null;
        }
        return (String) resultList.get(0);
    }

    @Override
    public String findDeviceTypeCodeById(Long deviceTypeId) {
        return deviceTypeJpaRepository.findById(deviceTypeId)
                .map(DeviceTypeEntity::getCode)
                .orElse(null);
    }

    /**
     * 기기 제어 감사 이력 기록 (ADM-DEV-04)
     * ※ resident/log 도메인의 ControlLogJpaRepository 사용
     *    — ResidentDevicePersistenceAdapter와 동일 패턴
     *    jpaRepository.save() 명시 호출 (03-backend-architecture.md §5)
     */
    @Override
    public void saveControlLog(Long deviceId, Long userId, String actorType,
                               String command, Map<String, Object> commandParams,
                               String result, String errorMessage, String correlationId) {
        String paramsJson = null;
        if (commandParams != null && !commandParams.isEmpty()) {
            try {
                paramsJson = objectMapper.writeValueAsString(commandParams);
            } catch (JsonProcessingException e) {
                log.warn("CONTROL_LOG commandParams 직렬화 실패: {}", commandParams, e);
                paramsJson = commandParams.toString();
            }
        }

        ControlLogEntity logEntity = ControlLogEntity.builder()
                .deviceId(deviceId)
                .userId(userId)
                .actorType(ActorType.valueOf(actorType))
                .command(command)
                .commandParams(paramsJson)
                .result(ControlResult.valueOf(result))
                .errorMessage(errorMessage)
                .correlationId(correlationId)
                .build();

        controlLogJpaRepository.save(logEntity);
        log.info("CONTROL_LOG 저장 완료 — deviceId: {}, userId: {}, actor: ADMIN, command: {}, result: {}",
                deviceId, userId, command, result);
    }

    private AdminDevice toModel(DeviceEntity entity) {
        return new AdminDevice(
                entity.getDeviceId(),
                entity.getSpaceId(),
                entity.getDeviceType().getDeviceTypeId(),
                entity.getDeviceType().getCode(),
                entity.getDeviceType().getName(),
                entity.getName(),
                entity.getModelName(),
                entity.getMacAddress(),
                entity.getMockEndpoint(),
                entity.getStatus().name(),
                entity.getCurrentState(),
                entity.getIsActive(),
                entity.getInstalledAt(),
                entity.getLastOnlineAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private AdminDevice toModelFromRow(Object[] row) {
        return new AdminDevice(
                ((Number) row[0]).longValue(),                               // deviceId
                ((Number) row[1]).longValue(),                               // spaceId
                ((Number) row[2]).longValue(),                               // deviceTypeId
                (String) row[3],                                             // deviceTypeCode
                (String) row[4],                                             // deviceTypeName
                (String) row[5],                                             // name
                (String) row[6],                                             // modelName
                (String) row[7],                                             // macAddress
                (String) row[8],                                             // mockEndpoint
                (String) row[9],                                             // status
                row[10] != null ? row[10].toString() : "{}",                 // currentState
                row[11] != null && (Boolean) row[11],                        // isActive
                row[12] != null ? ((java.sql.Timestamp) row[12]).toInstant().atOffset(java.time.ZoneOffset.of("+09:00")) : null,  // installedAt
                row[13] != null ? ((java.sql.Timestamp) row[13]).toInstant().atOffset(java.time.ZoneOffset.of("+09:00")) : null,  // lastOnlineAt
                row[14] != null ? ((java.sql.Timestamp) row[14]).toInstant().atOffset(java.time.ZoneOffset.of("+09:00")) : null,  // createdAt
                row[15] != null ? ((java.sql.Timestamp) row[15]).toInstant().atOffset(java.time.ZoneOffset.of("+09:00")) : null   // updatedAt
        );
    }

    private void appendDeviceFilters(StringBuilder sql, AdminDeviceListCommand command) {
        if (command.spaceId() != null) {
            sql.append(" AND d.space_id = :spaceId");
        }
        if (command.deviceTypeId() != null) {
            sql.append(" AND d.device_type_id = :deviceTypeId");
        }
        if (command.status() != null) {
            sql.append(" AND d.status = :status");
        }
        if (command.isActive() != null) {
            sql.append(" AND d.is_active = :isActive");
        }
    }

    private void bindDeviceFilterParams(jakarta.persistence.Query query, AdminDeviceListCommand command) {
        if (command.spaceId() != null) {
            query.setParameter("spaceId", command.spaceId());
        }
        if (command.deviceTypeId() != null) {
            query.setParameter("deviceTypeId", command.deviceTypeId());
        }
        if (command.status() != null) {
            query.setParameter("status", command.status());
        }
        if (command.isActive() != null) {
            query.setParameter("isActive", command.isActive());
        }
    }
}
