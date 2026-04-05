package com.coliving.admin.device.application.port.out;

import com.coliving.admin.device.model.AdminDevice;

import java.util.Optional;

/**
 * 디바이스 Repository 포트 (외부 의존 추상화)
 */
public interface AdminDeviceRepositoryPort {

    AdminDevice save(AdminDevice device);

    Optional<AdminDevice> findById(Long deviceId);

    boolean existsByMacAddress(String macAddress);

    boolean existsByMacAddressAndDeviceIdNot(String macAddress, Long deviceId);
}
