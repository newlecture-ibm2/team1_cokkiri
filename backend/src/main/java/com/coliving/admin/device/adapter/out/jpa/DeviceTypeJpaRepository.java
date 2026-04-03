package com.coliving.admin.device.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeviceTypeJpaRepository extends JpaRepository<DeviceTypeEntity, Long> {

    Optional<DeviceTypeEntity> findByCode(String code);

    boolean existsByCode(String code);
}
