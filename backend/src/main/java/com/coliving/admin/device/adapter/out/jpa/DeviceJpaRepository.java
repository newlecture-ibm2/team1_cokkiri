package com.coliving.admin.device.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeviceJpaRepository extends JpaRepository<DeviceEntity, Long> {

    List<DeviceEntity> findBySpaceId(Long spaceId);

    List<DeviceEntity> findBySpaceIdAndIsActiveTrue(Long spaceId);

    List<DeviceEntity> findByDeviceType_Code(String deviceTypeCode);

    boolean existsByDeviceId(Long deviceId);

    boolean existsByMacAddress(String macAddress);

    boolean existsByMacAddressAndDeviceIdNot(String macAddress, Long deviceId);
}
