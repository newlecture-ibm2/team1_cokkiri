package com.coliving.user.floor.application.port.in;

import com.coliving.user.floor.model.FloorView;

import java.util.List;

/**
 * 사용자용 층별 평면도 조회 유스케이스 (Public)
 */
public interface FloorViewUseCase {

    /**
     * 전체 층 목록 + 공간 블록 + 어노테이션 + 배경 정보 조회
     */
    List<FloorView> getAllFloors();
}
