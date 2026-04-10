package com.coliving.resident.log.adapter.out.persistence;

import com.coliving.admin.device.adapter.out.jpa.DeviceEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.coliving.resident.log.adapter.out.jpa.ControlLogEntity;
import com.coliving.resident.log.adapter.out.jpa.ControlLogJpaRepository;
import com.coliving.resident.log.adapter.out.jpa.ControlResult;
import com.coliving.resident.log.application.port.out.ControlLogRepositoryPort;
import com.coliving.resident.log.model.ControlLog;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
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
    private final EntityManager entityManager;

    @Override
    public Page<ControlLog> findByFilters(Long userId, OffsetDateTime startDateTime,
                                           OffsetDateTime endDateTime, String spaceType,
                                           String deviceTypeCode, String result,
                                           Pageable pageable) {

        // 1단계: spaceType, deviceTypeCode에 해당하는 deviceId 목록을 먼저 구한다 (DB 레벨 필터)
        // → 메모리 필터에서 null 반환하던 문제 해소 + 페이징 정합성 유지
        Set<Long> deviceIdFilter = null;

        if ((spaceType != null && !spaceType.isBlank()) || (deviceTypeCode != null && !deviceTypeCode.isBlank())) {
            List<DeviceEntity> allDevices = deviceJpaRepository.findAll();

            // deviceTypeCode 필터 (Lazy 프록시 접근 방지를 위해 여기서 미리 로드)
            if (deviceTypeCode != null && !deviceTypeCode.isBlank()) {
                allDevices = allDevices.stream()
                        .filter(d -> d.getDeviceType() != null && deviceTypeCode.equals(d.getDeviceType().getCode()))
                        .toList();
            }

            // spaceType 필터
            if (spaceType != null && !spaceType.isBlank()) {
                Set<Long> spaceIds = allDevices.stream().map(DeviceEntity::getSpaceId).collect(Collectors.toSet());
                if (!spaceIds.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    List<Object[]> spaceRows = entityManager
                            .createNativeQuery("SELECT s.space_id, s.type FROM spaces s WHERE s.space_id IN :ids AND s.deleted_at IS NULL")
                            .setParameter("ids", new java.util.ArrayList<>(spaceIds))
                            .getResultList();

                    Set<Long> matchingSpaceIds = spaceRows.stream()
                            .filter(row -> spaceType.equals(((Object[]) row)[1]))
                            .map(row -> ((Number) ((Object[]) row)[0]).longValue())
                            .collect(Collectors.toSet());

                    allDevices = allDevices.stream()
                            .filter(d -> matchingSpaceIds.contains(d.getSpaceId()))
                            .toList();
                }
            }

            deviceIdFilter = allDevices.stream().map(DeviceEntity::getDeviceId).collect(Collectors.toSet());

            // 필터 결과가 비어있으면 빈 페이지 반환
            if (deviceIdFilter.isEmpty()) {
                return Page.empty(pageable);
            }
        }

        // 2단계: Specification 구성 — 모든 필터를 DB 레벨에서 처리
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
            ControlResult controlResult = ControlResult.valueOf(result);
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("result"), controlResult));
        }
        if (deviceIdFilter != null) {
            Set<Long> finalDeviceIdFilter = deviceIdFilter;
            spec = spec.and((root, query, cb) ->
                    root.get("deviceId").in(finalDeviceIdFilter));
        }

        // 정렬: 최신순
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                org.springframework.data.domain.Sort.by("createdAt").descending());

        // 3단계: 조회
        Page<ControlLogEntity> logPage = controlLogJpaRepository.findAll(spec, sortedPageable);

        if (logPage.isEmpty()) {
            return logPage.map(e -> toModel(e, null, null));
        }

        // 4단계: 관련 device, space 일괄 조회 (N+1 방지)
        Set<Long> deviceIds = logPage.getContent().stream()
                .map(ControlLogEntity::getDeviceId).collect(Collectors.toSet());

        Map<Long, DeviceEntity> deviceMap = deviceJpaRepository.findAllById(deviceIds)
                .stream().collect(Collectors.toMap(DeviceEntity::getDeviceId, Function.identity()));

        Set<Long> spaceIds = deviceMap.values().stream()
                .map(DeviceEntity::getSpaceId).collect(Collectors.toSet());

        Map<Long, SpaceEntity> spaceMap = spaceJpaRepository.findAllById(spaceIds)
                .stream().collect(Collectors.toMap(SpaceEntity::getSpaceId, Function.identity()));

        // 5단계: Entity → Model 변환 (null 반환 없음)
        return logPage.map(entity -> {
            DeviceEntity device = deviceMap.get(entity.getDeviceId());
            SpaceEntity space = device != null ? spaceMap.get(device.getSpaceId()) : null;
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
