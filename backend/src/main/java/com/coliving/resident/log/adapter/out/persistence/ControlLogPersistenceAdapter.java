package com.coliving.resident.log.adapter.out.persistence;

import com.coliving.admin.device.adapter.out.jpa.DeviceEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.coliving.resident.log.adapter.out.jpa.ControlLogEntity;
import com.coliving.resident.log.adapter.out.jpa.ControlLogJpaRepository;
import com.coliving.resident.log.application.port.out.ControlLogRepositoryPort;
import com.coliving.resident.log.model.ControlLog;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 제어 이력 조회 Persistence Adapter (RES-LOG-01)
 * control_logs + devices + spaces JOIN 조회
 */
@Component
@RequiredArgsConstructor
public class ControlLogPersistenceAdapter implements ControlLogRepositoryPort {

    private final ControlLogJpaRepository controlLogJpaRepository;
    private final DeviceJpaRepository deviceJpaRepository;
    private final SpaceJpaRepository spaceJpaRepository;

    @Override
    public Page<ControlLog> findByFilters(Long userId, OffsetDateTime startDateTime,
                                           OffsetDateTime endDateTime, String spaceType,
                                           String deviceTypeCode, String result,
                                           Pageable pageable) {

        Specification<ControlLogEntity> spec = Specification.where(userIdEquals(userId));

        if (startDateTime != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("createdAt"), startDateTime));
        }
        if (endDateTime != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("createdAt"), endDateTime));
        }
        if (result != null && !result.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("result").as(String.class), result));
        }

        // 1차: control_logs 필터 조회
        Page<ControlLogEntity> logPage = controlLogJpaRepository.findAll(spec, pageable);

        if (logPage.isEmpty()) {
            return logPage.map(e -> toModel(e, null, null));
        }

        // 2차: 관련 device, space 일괄 조회 (N+1 방지)
        Set<Long> deviceIds = logPage.getContent().stream()
                .map(ControlLogEntity::getDeviceId).collect(Collectors.toSet());

        Map<Long, DeviceEntity> deviceMap = deviceJpaRepository.findAllById(deviceIds)
                .stream().collect(Collectors.toMap(DeviceEntity::getDeviceId, Function.identity()));

        Set<Long> spaceIds = deviceMap.values().stream()
                .map(DeviceEntity::getSpaceId).collect(Collectors.toSet());

        Map<Long, SpaceEntity> spaceMap = spaceJpaRepository.findAllById(spaceIds)
                .stream().collect(Collectors.toMap(SpaceEntity::getSpaceId, Function.identity()));

        // 3차: 추가 필터 (spaceType, deviceTypeCode는 메모리 필터)
        return logPage.map(entity -> {
            DeviceEntity device = deviceMap.get(entity.getDeviceId());
            SpaceEntity space = device != null ? spaceMap.get(device.getSpaceId()) : null;

            // spaceType 필터
            if (spaceType != null && !spaceType.isBlank() && space != null) {
                if (!space.getType().name().equals(spaceType)) {
                    return null;
                }
            }
            // deviceTypeCode 필터
            if (deviceTypeCode != null && !deviceTypeCode.isBlank() && device != null) {
                if (!device.getDeviceType().getCode().equals(deviceTypeCode)) {
                    return null;
                }
            }

            return toModel(entity, device, space);
        });
    }

    private Specification<ControlLogEntity> userIdEquals(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    private ControlLog toModel(ControlLogEntity entity, DeviceEntity device, SpaceEntity space) {
        return new ControlLog(
                entity.getControlLogId(),
                entity.getDeviceId(),
                device != null ? device.getName() : "삭제된 기기",
                device != null ? device.getDeviceType().getCode() : null,
                device != null ? device.getDeviceType().getName() : null,
                device != null ? device.getSpaceId() : null,
                space != null ? space.getName() : "삭제된 공간",
                space != null ? space.getType().name() : null,
                entity.getActorType().name(),
                entity.getCommand(),
                entity.getCommandParams(),
                entity.getResult().name(),
                entity.getErrorMessage(),
                entity.getCorrelationId(),
                entity.getCreatedAt()
        );
    }
}
