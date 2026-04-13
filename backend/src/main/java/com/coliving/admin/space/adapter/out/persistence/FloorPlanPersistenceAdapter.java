package com.coliving.admin.space.adapter.out.persistence;

import com.coliving.admin.space.adapter.out.jpa.FloorPlanEntity;
import com.coliving.admin.space.adapter.out.jpa.FloorPlanJpaRepository;
import com.coliving.admin.space.application.port.out.FloorPlanRepositoryPort;
import com.coliving.admin.space.model.FloorPlan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FloorPlanPersistenceAdapter implements FloorPlanRepositoryPort {

    private final FloorPlanJpaRepository floorPlanJpaRepository;

    @Override
    public Optional<FloorPlan> findByFloor(Integer floor) {
        return floorPlanJpaRepository.findByFloor(floor)
                .map(this::toModel);
    }

    @Override
    public FloorPlan save(FloorPlan floorPlan) {
        FloorPlanEntity entity;

        if (floorPlan.getFloorPlanId() != null) {
            // 기존 엔티티 업데이트
            entity = floorPlanJpaRepository.findById(floorPlan.getFloorPlanId())
                    .orElseThrow(() -> new IllegalStateException("FloorPlan not found: " + floorPlan.getFloorPlanId()));
            entity.updatePlan(floorPlan.getBlueprintOpacity(), floorPlan.getAnnotations());
            if (floorPlan.getBlueprintUrl() != null) {
                entity.updateBlueprint(floorPlan.getBlueprintUrl());
            }
        } else {
            // 신규 생성
            entity = FloorPlanEntity.builder()
                    .floor(floorPlan.getFloor())
                    .blueprintUrl(floorPlan.getBlueprintUrl())
                    .blueprintOpacity(floorPlan.getBlueprintOpacity())
                    .annotations(floorPlan.getAnnotations() != null ? floorPlan.getAnnotations() : new ArrayList<>())
                    .build();
        }

        FloorPlanEntity saved = floorPlanJpaRepository.save(entity);
        return toModel(saved);
    }

    private FloorPlan toModel(FloorPlanEntity entity) {
        return FloorPlan.builder()
                .floorPlanId(entity.getFloorPlanId())
                .floor(entity.getFloor())
                .blueprintUrl(entity.getBlueprintUrl())
                .blueprintOpacity(entity.getBlueprintOpacity())
                .annotations(entity.getAnnotations() != null ? entity.getAnnotations() : new ArrayList<>())
                .build();
    }
}
