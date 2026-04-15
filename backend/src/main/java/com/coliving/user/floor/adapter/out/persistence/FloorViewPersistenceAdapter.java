package com.coliving.user.floor.adapter.out.persistence;

import com.coliving.admin.space.adapter.out.jpa.FloorPlanEntity;
import com.coliving.admin.space.adapter.out.jpa.FloorPlanJpaRepository;
import com.coliving.admin.space.adapter.out.jpa.PrivateSpaceDetailEntity;
import com.coliving.admin.space.adapter.out.jpa.RoomTypeEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.admin.space.model.FloorAnnotation;
import com.coliving.user.floor.application.port.out.FloorViewRepositoryPort;
import com.coliving.user.floor.model.FloorView;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * 사용자용 층별 평면도 조회 Persistence Adapter.
 * 타 도메인(admin/space)의 JpaRepository를 READ 전용으로 DI한다.
 * (04-domain-collaboration.md §1 허용 범위)
 */
@Component
@RequiredArgsConstructor
public class FloorViewPersistenceAdapter implements FloorViewRepositoryPort {

    private final SpaceJpaRepository spaceJpaRepository;
    private final FloorPlanJpaRepository floorPlanJpaRepository;

    @Override
    public List<FloorView> findAllFloors() {
        // 1. 좌표가 배치된 전체 공간을 조회하여 floor로 그룹핑
        List<SpaceEntity> allSpaces = spaceJpaRepository.findAll();
        Map<Integer, List<SpaceEntity>> spacesByFloor = allSpaces.stream()
                .filter(s -> s.getFloor() != null && s.getPositionX() != null)
                .collect(Collectors.groupingBy(SpaceEntity::getFloor, TreeMap::new, Collectors.toList()));

        // 2. 전체 floor_plans 조회 → floor로 인덱싱
        Map<Integer, FloorPlanEntity> plansByFloor = floorPlanJpaRepository.findAll().stream()
                .collect(Collectors.toMap(FloorPlanEntity::getFloor, fp -> fp, (a, b) -> a));

        // 3. 공간이 존재하는 층만 표시 (관리자 에디터와 동일한 기준)
        // 4. 층별로 FloorView 생성
        List<FloorView> result = new ArrayList<>();
        for (Integer floor : spacesByFloor.keySet()) {
            FloorPlanEntity plan = plansByFloor.get(floor);
            List<SpaceEntity> spaces = spacesByFloor.get(floor);

            result.add(FloorView.builder()
                    .floor(floor)
                    .blueprintUrl(plan != null ? plan.getBlueprintUrl() : null)
                    .blueprintOpacity(plan != null ? plan.getBlueprintOpacity() : new BigDecimal("0.30"))
                    .spaces(toSpaceBlocks(spaces))
                    .annotations(toAnnotations(plan))
                    .build());
        }

        return result;
    }

    private List<FloorView.SpaceBlock> toSpaceBlocks(List<SpaceEntity> entities) {
        return entities.stream()
                .map(e -> {
                    // PRIVATE 공간의 roomTypeName 추출
                    String roomTypeName = null;
                    PrivateSpaceDetailEntity privateDetail = e.getPrivateDetail();
                    if (privateDetail != null) {
                        RoomTypeEntity roomType = privateDetail.getRoomType();
                        if (roomType != null) {
                            roomTypeName = roomType.getName();
                        }
                    }

                    return FloorView.SpaceBlock.builder()
                            .spaceId(e.getSpaceId())
                            .name(e.getName())
                            .type(e.getType().name())
                            .status(e.getStatus().name())
                            .roomTypeName(roomTypeName)
                            .positionX(e.getPositionX())
                            .positionY(e.getPositionY())
                            .positionW(e.getPositionW())
                            .positionH(e.getPositionH())
                            .build();
                })
                .toList();
    }

    private List<FloorView.Annotation> toAnnotations(FloorPlanEntity plan) {
        if (plan == null || plan.getAnnotations() == null) {
            return Collections.emptyList();
        }

        return plan.getAnnotations().stream()
                .map(a -> FloorView.Annotation.builder()
                        .label(a.getLabel())
                        .annotationTypeCode(a.getIconType())
                        .iconName(a.getIconName())
                        .color(a.getColor())
                        .positionX(a.getPositionX())
                        .positionY(a.getPositionY())
                        .positionW(a.getPositionW())
                        .positionH(a.getPositionH())
                        .build())
                .toList();
    }
}
