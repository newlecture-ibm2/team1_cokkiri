package com.coliving.admin.device.application.port.out;

import com.coliving.admin.device.application.command.AdminDeviceListCommand;
import com.coliving.admin.device.model.AdminDevice;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 디바이스 Repository 포트 (외부 의존 추상화)
 */
public interface AdminDeviceRepositoryPort {

    AdminDevice save(AdminDevice device);

    Optional<AdminDevice> findById(Long deviceId);

    List<AdminDevice> findAll();

    /** 필터+정렬 기기 목록 조회 (페이징은 Controller에서 처리) */
    List<AdminDevice> findAll(AdminDeviceListCommand command);

    boolean existsByMacAddress(String macAddress);

    boolean existsByMacAddressAndDeviceIdNot(String macAddress, Long deviceId);

    void updateActive(Long deviceId, boolean isActive);

    void updateStatus(Long deviceId, String status);

    /** 기기 수정 — deviceType 변경 없이 (ADM-DEV-05) */
    AdminDevice updateDevice(Long deviceId, String name, Long spaceId,
                             String modelName, String macAddress, String mockEndpoint);

    void softDelete(Long deviceId);

    boolean hasControlLogs(Long deviceId);

    /** spaceId로 공간 타입(PRIVATE/COMMON) 조회. 공간이 없으면 null 반환 */
    String findSpaceTypeById(Long spaceId);

    /** deviceTypeId로 기기 종류 코드(DOOR_LOCK 등) 조회. 없으면 null 반환 */
    String findDeviceTypeCodeById(Long deviceTypeId);

    /** 기기 제어 감사 이력 기록 (ADM-DEV-04) */
    void saveControlLog(Long deviceId, Long userId, String actorType,
                        String command, Map<String, Object> commandParams,
                        String result, String errorMessage, String correlationId);

    /** 기기 제어 성공 후 current_state(JSONB) 업데이트 */
    void updateCurrentState(Long deviceId, String currentState);

    /** deviceTypeId로 기기 종류의 commands JSON 조회. 없으면 null 반환 */
    String findDeviceTypeCommandsById(Long deviceTypeId);
}
