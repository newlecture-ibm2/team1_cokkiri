package com.coliving.user.floor.application.service;

import com.coliving.user.floor.application.port.in.FloorViewUseCase;
import com.coliving.user.floor.application.port.out.FloorViewRepositoryPort;
import com.coliving.user.floor.model.FloorView;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FloorViewService implements FloorViewUseCase {

    private final FloorViewRepositoryPort floorViewRepositoryPort;

    @Override
    public List<FloorView> getAllFloors() {
        log.info("[FLOOR-VIEW] 사용자용 전체 층 평면도 조회 요청");

        List<FloorView> floors = floorViewRepositoryPort.findAllFloors();

        log.info("[FLOOR-VIEW] 조회된 층 수: {}", floors.size());
        return floors;
    }
}
