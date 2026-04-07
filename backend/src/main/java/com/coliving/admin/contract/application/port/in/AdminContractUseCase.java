package com.coliving.admin.contract.application.port.in;

import com.coliving.admin.contract.application.command.AdminApproveContractCommand;
import com.coliving.admin.contract.application.command.AdminRejectContractCommand;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.admin.contract.application.result.AdminContractResult;

import java.util.List;

public interface AdminContractUseCase {
    List<AdminContractListResult> viewPendingContracts();
    AdminContractResult approveContract(Long adminId, AdminApproveContractCommand command);
    AdminContractResult rejectContract(Long adminId, AdminRejectContractCommand command);
}
