package com.coliving.user.history.application.result;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

/**
 * 활동 이력 단건 Result VO
 */
@Getter
@Builder
public class HistoryItemResult {

    /** CONTRACT | APPLICATION | POST | COMMENT */
    private String historyType;

    /** 해당 도메인의 PK (contractId / postId / commentId) */
    private Long referenceId;

    /** 제목 또는 요약 */
    private String title;

    /** 부가 설명 (공간 이름, 게시글 카테고리 등) */
    private String description;

    /** 상태 (ACTIVE, EXPIRED, PENDING 등 — 계약/신청 전용) */
    private String status;

    /** 기록 일시 */
    private OffsetDateTime createdAt;
}
