package com.coliving.user.floor.application.port.out;

import com.coliving.user.floor.model.FloorView;

import java.util.List;

/**
 * 사용자용 층별 평면도 조회 Repository Port (읽기 전용)
 */
public interface FloorViewRepositoryPort {

    /**
     * 전체 층의 평면도 데이터를 조회한다.
     * 좌표 미배치(positionX == null) 공간은 제외된다.
     */
    List<FloorView> findAllFloors();
}
