package com.coliving.admin.contract.application.port.in;

import com.coliving.admin.contract.application.command.AdminApproveContractCommand;
import com.coliving.admin.contract.application.command.AdminCreateContractCommand;
import com.coliving.admin.contract.application.command.AdminRejectContractCommand;
import com.coliving.admin.contract.application.command.AdminUpdateContractCommand;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.admin.contract.application.result.AdminContractResult;
import com.coliving.user.contract.model.ContractStatus;

import java.time.LocalDate;
import java.util.List;

public interface AdminContractUseCase {

    /** ADM-CTR-05: PENDING 신청 목록 조회 */
    List<AdminContractListResult> viewPendingContracts();

    /** ADM-CTR-01: 전체 계약 목록 조회 (상태, 공간, 기간 필터 가능) */
    List<AdminContractListResult> viewAllContracts(ContractStatus status, Long spaceId, LocalDate startDate, LocalDate endDate);

    /** ADM-CTR-02: 관리자 직접 계약 등록 (ACTIVE 직행) */
    AdminContractResult createContract(Long adminId, AdminCreateContractCommand command);

    /** ADM-CTR-03: 계약 수정 (기간, 임대료) */
    AdminContractResult updateContract(Long adminId, AdminUpdateContractCommand command);

    /** ADM-CTR-04: 계약 만료 처리 */
    AdminContractResult expireContract(Long adminId, Long contractId);

    /** ADM-CTR-04: 계약 해지 처리 */
    AdminContractResult terminateContract(Long adminId, Long contractId);

    /** ADM-CTR-05: 신청 승인 */
    AdminContractResult approveContract(Long adminId, AdminApproveContractCommand command);

    /** ADM-CTR-05: 신청 반려 */
    AdminContractResult rejectContract(Long adminId, AdminRejectContractCommand command);
}
