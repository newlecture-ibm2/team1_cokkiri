package com.coliving.admin.space.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FloorPlanJpaRepository extends JpaRepository<FloorPlanEntity, Long> {

    Optional<FloorPlanEntity> findByFloor(Integer floor);
}
