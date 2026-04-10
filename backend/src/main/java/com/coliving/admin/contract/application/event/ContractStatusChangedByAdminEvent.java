package com.coliving.admin.contract.application.event;

import com.coliving.user.contract.model.ContractStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContractStatusChangedByAdminEvent {
    private final Long contractId;
    private final Long userId;
    private final Long spaceId;
    private final String spaceName; // 공간 이름을 미리 담아서 컨텍스트 유실 방지
    private final ContractStatus newStatus;
    private final String message;
    private final String rejectedReason;
}
