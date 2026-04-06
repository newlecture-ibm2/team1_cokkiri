package com.coliving.resident.device_control.adapter.out.persistence;

import com.coliving.admin.device.adapter.out.jpa.DeviceEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.coliving.resident.device_control.application.port.out.ResidentDeviceRepositoryPort;
import com.coliving.resident.device_control.model.ResidentDevice;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ResidentDevicePersistenceAdapter implements ResidentDeviceRepositoryPort {

    private final DeviceJpaRepository deviceJpaRepository;
    private final EntityManager entityManager;

    @Override
    public List<ResidentDevice> findActiveDevicesBySpaceId(Long spaceId) {
        return deviceJpaRepository.findBySpaceIdAndIsActiveTrue(spaceId).stream()
                .map(this::toModel)
                .toList();
    }

    /**
     * 전체 공용 공간(COMMON)의 활성 기기 조회 (RES-DEV-01)
     * ※ 크로스 도메인 접근: spaces 테이블을 네이티브 쿼리로 JOIN
     *    (룰 04: SpaceEntity import 없이 네이티브 SQL로 사이드 이펙트 최소화)
     */
    @Override
    public List<ResidentDevice> findActiveCommonDevices() {
        @SuppressWarnings("unchecked")
        List<Long> commonSpaceIds = entityManager
                .createNativeQuery("SELECT s.space_id FROM spaces s WHERE s.type = 'COMMON' AND s.deleted_at IS NULL")
                .getResultList();

        if (commonSpaceIds.isEmpty()) {
            return List.of();
        }

        return commonSpaceIds.stream()
                .flatMap(spaceId -> deviceJpaRepository.findBySpaceIdAndIsActiveTrue(spaceId).stream())
                .map(this::toModel)
                .toList();
    }

    @Override
    public Optional<ResidentDevice> findById(Long deviceId) {
        return deviceJpaRepository.findById(deviceId).map(this::toModel);
    }

    /**
     * 해당 유저가 특정 공용 공간에 현재시각 기준 APPROVED 예약을 보유하고 있는지 확인
     * (ERD 비즈니스 규칙 #9)
     * ※ 크로스 도메인 접근: reservations 테이블을 네이티브 쿼리로 조회
     *    (룰 04: ReservationEntity import 없이 식별자 기반 SQL로 사이드 이펙트 최소화)
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
     *    (룰 04: ContractEntity import 없이 식별자 기반 SQL로 사이드 이펙트 최소화)
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

    private ResidentDevice toModel(DeviceEntity entity) {
        return new ResidentDevice(
                entity.getDeviceId(),
                entity.getSpaceId(),
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
}
