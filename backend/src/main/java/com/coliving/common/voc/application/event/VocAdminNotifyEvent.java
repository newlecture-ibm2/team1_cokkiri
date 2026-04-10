package com.coliving.common.voc.application.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 민원 등록/수정 후 관리자 알림 발송용. 트랜잭션 커밋 이후에 처리됩니다.
 */
@Getter
@RequiredArgsConstructor
public class VocAdminNotifyEvent {
    private final Long vocId;
    private final String vocTitle;
    /** 알림 제목 (예: "새로운 민원이 등록되었습니다") */
    private final String alertTitle;
}
