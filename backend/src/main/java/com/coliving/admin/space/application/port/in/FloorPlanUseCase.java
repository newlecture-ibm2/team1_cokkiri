package com.coliving.admin.space.application.port.in;

import com.coliving.admin.space.application.command.SaveFloorPlanCommand;
import com.coliving.admin.space.application.result.FloorPlanResult;
import org.springframework.web.multipart.MultipartFile;

public interface FloorPlanUseCase {

    /**
     * 특정 층의 평면도 조회 (blueprint + annotations).
     * 해당 층 데이터가 없으면 빈 기본값 반환.
     */
    FloorPlanResult getFloorPlan(Integer floor);

    /**
     * 평면도 저장 (opacity + annotations 일괄).
     */
    FloorPlanResult saveFloorPlan(SaveFloorPlanCommand command);

    /**
     * 배경 도면 이미지 업로드.
     */
    FloorPlanResult uploadBlueprint(Integer floor, MultipartFile file);

    /**
     * 배경 도면 이미지 삭제.
     */
    void deleteBlueprint(Integer floor);
}
