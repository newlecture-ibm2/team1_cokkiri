package com.coliving.resident.log.adapter.out.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ControlLogJpaRepository extends JpaRepository<ControlLogEntity, Long>,
        JpaSpecificationExecutor<ControlLogEntity> {

    Page<ControlLogEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<ControlLogEntity> findByDeviceIdOrderByCreatedAtDesc(Long deviceId, Pageable pageable);

    List<ControlLogEntity> findByDeviceId(Long deviceId);

    boolean existsByDeviceId(Long deviceId);

    long countByUserIdAndResult(Long userId, ControlResult result);
}
