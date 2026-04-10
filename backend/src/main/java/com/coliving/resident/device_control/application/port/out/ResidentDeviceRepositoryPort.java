package com.coliving.resident.device_control.application.port.out;

import com.coliving.resident.device_control.model.ResidentDevice;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 입주자 기기 Repository 포트
 */
public interface ResidentDeviceRepositoryPort {

    /** 개인 공간(PRIVATE)의 활성 기기 조회 */
    List<ResidentDevice> findActiveDevicesBySpaceId(Long spaceId);

    /** 전체 공용 공간(COMMON)의 활성 기기 조회 (RES-DEV-01) */
    List<ResidentDevice> findActiveCommonDevices();

    Optional<ResidentDevice> findById(Long deviceId);

    /**
     * 해당 유저가 특정 공용 공간에 현재시각 기준 APPROVED 예약을 보유하고 있는지 확인
     * (ERD 비즈니스 규칙 #9: COMMON 기기 제어 = 현재시각 APPROVED 예약 필요)
     * ※ 크로스 도메인 접근: reservations 테이블을 네이티브 쿼리로 조회
     *    (룰 04: Entity/Repository import 없이 식별자 기반 SQL로 사이드 이펙트 최소화)
     */
    boolean hasApprovedReservationNow(Long userId, Long spaceId);

    /**
     * 해당 유저의 계약이 현재 ACTIVE 상태인지 DB에서 재검증
     * ※ 크로스 도메인 접근: contracts 테이블을 네이티브 쿼리로 조회
     *    (룰 04: Entity/Repository import 없이 식별자 기반 SQL로 사이드 이펙트 최소화)
     */
    boolean hasActiveContract(Long userId);

    /**
     * 기기 제어 후 CONTROL_LOG 감사 이력 저장 (RES-DEV-02 필수)
     * ※ resident/log 도메인의 ControlLogJpaRepository 사용 — 같은 resident 최상위 도메인
     *
     * @param actorType  "RESIDENT" 또는 "ADMIN"
     * @param result     "SUCCESS" 또는 "FAILURE"
     */
    void saveControlLog(Long deviceId, Long userId, String actorType,
                        String command, Map<String, Object> commandParams,
                        String result, String errorMessage, String correlationId);

    /** 기기의 현재 current_state(JSONB) 조회 — 상태 병합(merge)에 사용 */
    String findCurrentState(Long deviceId);

    /** 기기 제어 성공 후 current_state(JSONB) 업데이트 */
    void updateCurrentState(Long deviceId, String currentState);

    /** IoT 통신 실패 시 기기 상태를 ERROR로 자동 전환 */
    void updateDeviceStatus(Long deviceId, String status);
}
