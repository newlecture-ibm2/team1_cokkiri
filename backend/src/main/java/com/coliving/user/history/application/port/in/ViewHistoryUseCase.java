package com.coliving.user.history.application.port.in;

import com.coliving.user.history.application.result.HistoryListResult;

public interface ViewHistoryUseCase {

    /**
     * 사용자의 활동 이력을 유형별로 조회합니다.
     *
     * @param userId 사용자 ID
     * @param type   이력 유형 (CONTRACT, APPLICATION, POST, COMMENT, null=전체)
     * @param page   페이지 번호
     * @param size   페이지 크기
     */
    HistoryListResult viewHistory(Long userId, String type, int page, int size);
}
