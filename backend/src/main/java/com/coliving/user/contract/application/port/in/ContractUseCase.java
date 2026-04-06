package com.coliving.user.contract.application.port.in;

import com.coliving.user.contract.application.command.ContractApplyCommand;
import com.coliving.user.contract.application.result.ContractResult;
import com.coliving.user.contract.application.result.ContractDraftResult;
import java.util.List;

public interface ContractUseCase {

    /**
     * 계약 임시저장
     */
    ContractResult saveDraft(Long userId, ContractApplyCommand command);

    /**
     * 임시저장된 계약 조회
     */
    ContractDraftResult getDraft(Long userId, Long spaceId);

    /**
     * 내 계약 내역 전체 조회
     */
    List<ContractDraftResult> getMyContracts(Long userId);

    /**
     * 최종 계약 신청 (제출)
     */
    ContractResult submitContract(Long userId, ContractApplyCommand command);
}
