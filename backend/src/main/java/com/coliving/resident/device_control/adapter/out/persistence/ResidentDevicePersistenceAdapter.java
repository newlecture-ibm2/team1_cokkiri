package com.coliving.resident.device_control.adapter.out.persistence;

import com.coliving.admin.device.adapter.out.jpa.DeviceEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.coliving.admin.device.model.DeviceStatus;
import com.coliving.resident.device_control.application.port.out.ResidentDeviceRepositoryPort;
import com.coliving.resident.device_control.model.ResidentDevice;
import com.coliving.resident.log.adapter.out.jpa.ActorType;
import com.coliving.resident.log.adapter.out.jpa.ControlLogEntity;
import com.coliving.resident.log.adapter.out.jpa.ControlLogJpaRepository;
import com.coliving.resident.log.adapter.out.jpa.ControlResult;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResidentDevicePersistenceAdapter implements ResidentDeviceRepositoryPort {

    private final DeviceJpaRepository deviceJpaRepository;
    private final ControlLogJpaRepository controlLogJpaRepository;
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    /**
     * 개인 공간(PRIVATE)의 활성 기기 조회
     * - spaceId가 고정이므로 공간 정보를 한 번만 조회하여 N+1 방지
     */
    @Override
    public List<ResidentDevice> findActiveDevicesBySpaceId(Long spaceId) {
        Object[] spaceInfo = findSpaceInfo(spaceId);
        String spaceName = spaceInfo != null ? (String) spaceInfo[0] : null;
        String spaceType = spaceInfo != null ? (String) spaceInfo[1] : null;
        Integer spaceFloor = spaceInfo != null && spaceInfo[2] != null ? ((Number) spaceInfo[2]).intValue() : null;

        return deviceJpaRepository.findBySpaceIdAndIsActiveTrue(spaceId).stream()
                .map(entity -> toModel(entity, spaceName, spaceType, spaceFloor))
                .toList();
    }

    /**
     * 전체 공용 공간(COMMON)의 활성 기기 조회 (RES-DEV-01)
     * - 공간 ID + 이름 + 타입을 한 번에 조회하여 N+1 방지
     * ※ 크로스 도메인 접근: spaces 테이블을 네이티브 쿼리로 JOIN
     */
    @Override
    public List<ResidentDevice> findActiveCommonDevices() {
        @SuppressWarnings("unchecked")
        List<Object[]> commonSpaces = entityManager
                .createNativeQuery(
                        "SELECT s.space_id, s.name, s.type, s.floor FROM spaces s " +
                        "WHERE s.type = 'COMMON' AND s.deleted_at IS NULL")
                .getResultList();

        if (commonSpaces.isEmpty()) {
            return List.of();
        }

        // 공간 정보 Map 구성 (N+1 방지)
        Map<Long, Object[]> spaceInfoMap = new HashMap<>();
        for (Object[] row : commonSpaces) {
            Long spaceId = ((Number) row[0]).longValue();
            spaceInfoMap.put(spaceId, new Object[]{row[1], row[2], row[3]});
        }

        return spaceInfoMap.keySet().stream()
                .flatMap(spaceId -> deviceJpaRepository.findBySpaceIdAndIsActiveTrue(spaceId).stream()
                        .map(entity -> {
                            Object[] info = spaceInfoMap.get(spaceId);
                            Integer floor = info[2] != null ? ((Number) info[2]).intValue() : null;
                            return toModel(entity, (String) info[0], (String) info[1], floor);
                        }))
                .toList();
    }

    @Override
    public Optional<ResidentDevice> findById(Long deviceId) {
        return deviceJpaRepository.findById(deviceId).map(entity -> {
            Object[] spaceInfo = findSpaceInfo(entity.getSpaceId());
            return toModel(entity,
                    spaceInfo != null ? (String) spaceInfo[0] : null,
                    spaceInfo != null ? (String) spaceInfo[1] : null,
                    spaceInfo != null && spaceInfo[2] != null ? ((Number) spaceInfo[2]).intValue() : null);
        });
    }

    /**
     * 해당 유저가 특정 공용 공간에 현재시각 기준 APPROVED 예약을 보유하고 있는지 확인
     * (ERD 비즈니스 규칙 #9)
     * ※ 크로스 도메인 접근: reservations 테이블을 네이티브 쿼리로 조회
     */
    @Override
    public boolean hasApprovedReservationNow(Long userId, Long spaceId) {
        var resultList = entityManager
                .createNativeQuery(
                    "SELECT 1 FROM reservations r " +
                    "WHERE r.user_id = :userId " +
                    "AND r.space_id = :spaceId " +
                    "AND r.status = 'APPROVED' " +
                    "AND r.reservation_date = CURRENT_DATE " +
                    "AND r.start_time <= CURRENT_TIME " +
                    "AND r.end_time > CURRENT_TIME " +
                    "AND r.deleted_at IS NULL " +
                    "LIMIT 1")
                .setParameter("userId", userId)
                .setParameter("spaceId", spaceId)
                .getResultList();
        return !resultList.isEmpty();
    }

    /**
     * 해당 유저의 계약이 현재 ACTIVE 상태인지 DB에서 재검증
     * ※ 크로스 도메인 접근: contracts 테이블을 네이티브 쿼리로 조회
     */
    @Override
    public boolean hasActiveContract(Long userId) {
        var resultList = entityManager
                .createNativeQuery(
                    "SELECT 1 FROM contracts c " +
                    "WHERE c.user_id = :userId " +
                    "AND c.status = 'ACTIVE' " +
                    "AND c.deleted_at IS NULL " +
                    "LIMIT 1")
                .setParameter("userId", userId)
                .getResultList();
        return !resultList.isEmpty();
    }

    /**
     * 기기 제어 후 CONTROL_LOG 감사 이력 저장 (RES-DEV-02 필수)
     * ※ resident/log 도메인의 ControlLogJpaRepository 사용 — 같은 resident 최상위 도메인
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
        log.info("CONTROL_LOG 저장 완료 — deviceId: {}, userId: {}, command: {}, result: {}",
                deviceId, userId, command, result);
    }


    @Override
    public String findCurrentState(Long deviceId) {
        return deviceJpaRepository.findById(deviceId)
                .map(DeviceEntity::getCurrentState)
                .orElse("{}");
    }

    @Override
    public void updateCurrentState(Long deviceId, String currentState) {
        deviceJpaRepository.findById(deviceId).ifPresent(device -> {
            device.updateCurrentState(currentState);
            deviceJpaRepository.save(device);
        });
    }

    // ── 헬퍼: 공간 정보(name, type) 단건 조회 ──

    private Object[] findSpaceInfo(Long spaceId) {
        @SuppressWarnings("unchecked")
        List<Object[]> resultList = entityManager
                .createNativeQuery(
                        "SELECT s.name, s.type, s.floor FROM spaces s " +
                        "WHERE s.space_id = :spaceId AND s.deleted_at IS NULL")
                .setParameter("spaceId", spaceId)
                .getResultList();
        return resultList.isEmpty() ? null : resultList.get(0);
    }

    // ── Entity → 도메인 모델 변환 ──

    private ResidentDevice toModel(DeviceEntity entity, String spaceName, String spaceType, Integer spaceFloor) {
        return new ResidentDevice(
                entity.getDeviceId(),
                entity.getSpaceId(),
                spaceName,
                spaceType,
                spaceFloor,
                entity.getDeviceType().getCode(),
                entity.getDeviceType().getName(),
                entity.getDeviceType().getUiType(),
                entity.getDeviceType().getCommands(),
                entity.getName(),
                entity.getModelName(),
                entity.getStatus().name(),
                entity.getCurrentState(),
                entity.getIsActive(),
                entity.getLastOnlineAt()
        );
    }

    @Override
    public void updateDeviceStatus(Long deviceId, String status) {
        deviceJpaRepository.findById(deviceId).ifPresent(device -> {
            device.updateStatus(DeviceStatus.valueOf(status));
            deviceJpaRepository.save(device);
        });
    }
}
