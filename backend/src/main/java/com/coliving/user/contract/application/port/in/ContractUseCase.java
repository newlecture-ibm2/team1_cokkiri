package com.coliving.user.contract.application.port.in;

import com.coliving.user.contract.application.command.ContractApplyCommand;
import com.coliving.user.contract.application.result.ContractResult;

public interface ContractUseCase {

    /**
     * 계약 임시저장
     */
    ContractResult saveDraft(Long userId, ContractApplyCommand command);

    /**
     * 최종 계약 신청 (제출)
     */
    ContractResult submitContract(Long userId, ContractApplyCommand command);
}
