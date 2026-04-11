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
                    .status(DeviceStatus.valueOf(device.status()))
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
        List<DeviceEntity> entities = deviceJpaRepository.findAll();
        Map<Long, Object[]> spaceInfoMap = fetchSpaceInfoMap(entities);
        return entities.stream()
                .map(e -> toModel(e, spaceInfoMap.get(e.getSpaceId())))
                .toList();
    }

    @Override
    public List<AdminDevice> findAll(AdminDeviceListCommand command) {
        List<DeviceEntity> all = deviceJpaRepository.findAll();
        List<DeviceEntity> filtered = all.stream()
                .filter(d -> command.spaceId() == null || d.getSpaceId().equals(command.spaceId()))
                .filter(d -> command.deviceTypeId() == null || d.getDeviceType().getDeviceTypeId().equals(command.deviceTypeId()))
                .filter(d -> command.status() == null || d.getStatus().name().equals(command.status()))
                .filter(d -> command.isActive() == null || d.getIsActive().equals(command.isActive()))
                .sorted((a, b) -> {
                    if (b.getCreatedAt() == null && a.getCreatedAt() == null) return 0;
                    if (b.getCreatedAt() == null) return -1;
                    if (a.getCreatedAt() == null) return 1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();

        Map<Long, Object[]> spaceInfoMap = fetchSpaceInfoMap(filtered);
        return filtered.stream()
                .map(e -> toModel(e, spaceInfoMap.get(e.getSpaceId())))
                .toList();
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

    @Override
    public void updateCurrentState(Long deviceId, String currentState) {
        deviceJpaRepository.findById(deviceId).ifPresent(device -> {
            device.updateCurrentState(currentState);
            deviceJpaRepository.save(device);
        });
    }

    private AdminDevice toModel(DeviceEntity entity) {
        return toModel(entity, findSpaceInfo(entity.getSpaceId()));
    }

    private AdminDevice toModel(DeviceEntity entity, Object[] spaceInfo) {
        String spaceName = spaceInfo != null ? (String) spaceInfo[0] : null;
        Integer spaceFloor = spaceInfo != null && spaceInfo[1] != null ? ((Number) spaceInfo[1]).intValue() : null;

        return new AdminDevice(
                entity.getDeviceId(),
                entity.getSpaceId(),
                spaceName,
                spaceFloor,
                entity.getDeviceType().getDeviceTypeId(),
                entity.getDeviceType().getCode(),
                entity.getDeviceType().getName(),
                entity.getDeviceType().getCommands(),
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

    private Object[] findSpaceInfo(Long spaceId) {
        var resultList = entityManager
                .createNativeQuery("SELECT s.name, s.floor FROM spaces s WHERE s.space_id = :spaceId AND s.deleted_at IS NULL")
                .setParameter("spaceId", spaceId)
                .getResultList();
        if (resultList.isEmpty()) return null;
        return (Object[]) resultList.get(0);
    }

    private Map<Long, Object[]> fetchSpaceInfoMap(List<DeviceEntity> entities) {
        if (entities.isEmpty()) return Map.of();
        List<Long> spaceIds = entities.stream().map(DeviceEntity::getSpaceId).distinct().toList();
        var resultList = entityManager
                .createNativeQuery("SELECT s.space_id, s.name, s.floor FROM spaces s WHERE s.space_id IN :spaceIds AND s.deleted_at IS NULL")
                .setParameter("spaceIds", spaceIds)
                .getResultList();
        
        Map<Long, Object[]> map = new java.util.HashMap<>();
        for (Object row : resultList) {
            Object[] cols = (Object[]) row;
            Long spaceId = ((Number) cols[0]).longValue();
            map.put(spaceId, new Object[]{ cols[1], cols[2] });
        }
        return map;
    }

    @Override
    public String findDeviceTypeCommandsById(Long deviceTypeId) {
        return deviceTypeJpaRepository.findById(deviceTypeId)
                .map(DeviceTypeEntity::getCommands)
                .orElse(null);
    }
}
