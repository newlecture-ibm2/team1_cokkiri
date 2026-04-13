package com.coliving.admin.space.application.port.out;

import com.coliving.admin.space.model.FloorPlan;

import java.util.Optional;

public interface FloorPlanRepositoryPort {

    Optional<FloorPlan> findByFloor(Integer floor);

    FloorPlan save(FloorPlan floorPlan);
}
