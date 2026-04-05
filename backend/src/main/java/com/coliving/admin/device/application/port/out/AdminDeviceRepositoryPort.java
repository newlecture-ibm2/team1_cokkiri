package com.coliving.admin.device.application.port.out;

import com.coliving.admin.device.model.AdminDevice;

import java.util.List;
import java.util.Optional;

/**
 * 디바이스 Repository 포트 (외부 의존 추상화)
 */
public interface AdminDeviceRepositoryPort {

    AdminDevice save(AdminDevice device);

    Optional<AdminDevice> findById(Long deviceId);

    List<AdminDevice> findAll();

    boolean existsByMacAddress(String macAddress);

    boolean existsByMacAddressAndDeviceIdNot(String macAddress, Long deviceId);

    void updateActive(Long deviceId, boolean isActive);

    void updateStatus(Long deviceId, String status);

    void softDelete(Long deviceId);

    boolean hasControlLogs(Long deviceId);
}
