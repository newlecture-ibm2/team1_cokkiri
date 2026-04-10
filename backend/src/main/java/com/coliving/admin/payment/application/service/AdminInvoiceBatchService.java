package com.coliving.admin.payment.application.service;

import com.coliving.admin.contract.application.port.out.AdminContractRepositoryPort;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.admin.payment.application.port.in.AdminInvoiceBatchUseCase;
import com.coliving.admin.payment.application.port.out.PaymentRepositoryPort;
import com.coliving.admin.payment.model.Payment;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.admin.payment.model.PaymentType;
import com.coliving.user.contract.model.ContractStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminInvoiceBatchService implements AdminInvoiceBatchUseCase {

    private final AdminContractRepositoryPort contractRepositoryPort;
    private final PaymentRepositoryPort paymentRepositoryPort;

    @Override
    @Transactional
    public int generateMonthlyInvoices(LocalDate referenceDate) {
        int year = referenceDate.getYear();
        int month = referenceDate.getMonthValue();
        log.info("Starting monthly invoice generation for {}/{}", year, month);

        // 1. ACTIVE 상태의 모든 계약 조회
        List<AdminContractListResult> activeContracts = contractRepositoryPort.findAllContracts(ContractStatus.ACTIVE);
        log.info("Found {} active contracts to process", activeContracts.size());

        int count = 0;
        for (AdminContractListResult contract : activeContracts) {
            try {
                // 2. 이미 해당 월에 RENT 인보이스가 생성되었는지 확인 (중복 방지)
                if (paymentRepositoryPort.existsByContractAndMonth(contract.getContractId(), PaymentType.RENT, year, month)) {
                    log.debug("Invoice already exists for contractId={} in {}/{}", contract.getContractId(), year, month);
                    continue;
                }

                // 3. 인보이스 생성 (PENDING 상태)
                Payment invoice = new Payment();
                invoice.setContractId(contract.getContractId());
                invoice.setUserId(contract.getUserId());
                invoice.setType(PaymentType.RENT);
                invoice.setAmount(contract.getMonthlyRent()); // 월세 금액 그대로 청구
                invoice.setStatus(PaymentStatus.PENDING);
                invoice.setBillingDate(referenceDate);

                paymentRepositoryPort.save(invoice);
                count++;
            } catch (Exception e) {
                log.error("Failed to generate invoice for contract {}: {}", contract.getContractId(), e.getMessage());
            }
        }

        log.info("Successfully generated {} invoices for {}/{}", count, year, month);
        return count;
    }
}
