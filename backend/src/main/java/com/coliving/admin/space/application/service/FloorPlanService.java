package com.coliving.admin.space.application.service;

import com.coliving.admin.space.application.command.SaveFloorPlanCommand;
import com.coliving.admin.space.application.port.in.FloorPlanUseCase;
import com.coliving.admin.space.application.port.out.FileStoragePort;
import com.coliving.admin.space.application.port.out.FloorPlanRepositoryPort;
import com.coliving.admin.space.application.result.FloorPlanResult;
import com.coliving.admin.space.model.FloorPlan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class FloorPlanService implements FloorPlanUseCase {

    private final FloorPlanRepositoryPort floorPlanRepositoryPort;
    private final FileStoragePort fileStoragePort;

    /**
     * 평면도의 blueprint 이미지를 저장할 때 사용하는 가상 spaceId.
     * LocalFileStorageAdapter가 spaceId 기반으로 디렉토리를 구분하므로,
     * floor_plans 전용 디렉토리를 위해 0L을 사용한다.
     */
    private static final Long FLOOR_PLAN_STORAGE_ID = 0L;

    @Override
    @Transactional(readOnly = true)
    public FloorPlanResult getFloorPlan(Integer floor) {
        FloorPlan model = floorPlanRepositoryPort.findByFloor(floor)
                .orElse(FloorPlan.builder()
                        .floor(floor)
                        .blueprintOpacity(new BigDecimal("0.30"))
                        .annotations(new ArrayList<>())
                        .build());
        return FloorPlanResult.from(model);
    }

    @Override
    @Transactional
    public FloorPlanResult saveFloorPlan(SaveFloorPlanCommand command) {
        FloorPlan existing = floorPlanRepositoryPort.findByFloor(command.getFloor())
                .orElse(null);

        FloorPlan toSave;
        if (existing != null) {
            toSave = FloorPlan.builder()
                    .floorPlanId(existing.getFloorPlanId())
                    .floor(existing.getFloor())
                    .blueprintUrl(existing.getBlueprintUrl())
                    .blueprintOpacity(command.getBlueprintOpacity() != null
                            ? command.getBlueprintOpacity()
                            : existing.getBlueprintOpacity())
                    .annotations(command.getAnnotations() != null
                            ? command.getAnnotations()
                            : existing.getAnnotations())
                    .build();
        } else {
            toSave = FloorPlan.builder()
                    .floor(command.getFloor())
                    .blueprintOpacity(command.getBlueprintOpacity() != null
                            ? command.getBlueprintOpacity()
                            : new BigDecimal("0.30"))
                    .annotations(command.getAnnotations() != null
                            ? command.getAnnotations()
                            : new ArrayList<>())
                    .build();
        }

        FloorPlan saved = floorPlanRepositoryPort.save(toSave);
        return FloorPlanResult.from(saved);
    }

    @Override
    @Transactional
    public FloorPlanResult uploadBlueprint(Integer floor, MultipartFile file) {
        // 파일 저장 (기존 FileStoragePort 재사용)
        String fileName = fileStoragePort.storeFile(FLOOR_PLAN_STORAGE_ID, file);
        String blueprintUrl = "/api/uploads/spaces/" + FLOOR_PLAN_STORAGE_ID + "/" + fileName;

        // 기존 도면이 있으면 이전 파일 삭제
        FloorPlan existing = floorPlanRepositoryPort.findByFloor(floor).orElse(null);
        if (existing != null && existing.getBlueprintUrl() != null) {
            fileStoragePort.deleteFile(existing.getBlueprintUrl());
        }

        FloorPlan toSave;
        if (existing != null) {
            toSave = FloorPlan.builder()
                    .floorPlanId(existing.getFloorPlanId())
                    .floor(existing.getFloor())
                    .blueprintUrl(blueprintUrl)
                    .blueprintOpacity(existing.getBlueprintOpacity())
                    .annotations(existing.getAnnotations())
                    .build();
        } else {
            toSave = FloorPlan.builder()
                    .floor(floor)
                    .blueprintUrl(blueprintUrl)
                    .blueprintOpacity(new BigDecimal("0.30"))
                    .annotations(new ArrayList<>())
                    .build();
        }

        FloorPlan saved = floorPlanRepositoryPort.save(toSave);
        return FloorPlanResult.from(saved);
    }

    @Override
    @Transactional
    public void deleteBlueprint(Integer floor) {
        FloorPlan existing = floorPlanRepositoryPort.findByFloor(floor).orElse(null);
        if (existing == null || existing.getBlueprintUrl() == null) {
            return; // 삭제할 도면 없음 — 멱등
        }

        // 파일 시스템에서 삭제
        fileStoragePort.deleteFile(existing.getBlueprintUrl());

        // DB에서 blueprint_url 제거
        FloorPlan toSave = FloorPlan.builder()
                .floorPlanId(existing.getFloorPlanId())
                .floor(existing.getFloor())
                .blueprintUrl(null)
                .blueprintOpacity(existing.getBlueprintOpacity())
                .annotations(existing.getAnnotations())
                .build();

        floorPlanRepositoryPort.save(toSave);
    }
}
