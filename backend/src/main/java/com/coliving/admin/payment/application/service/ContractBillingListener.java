package com.coliving.admin.payment.application.service;

import com.coliving.admin.contract.application.event.ContractStatusChangedByAdminEvent;
import com.coliving.admin.payment.application.port.out.PaymentRepositoryPort;
import com.coliving.admin.payment.model.Payment;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.admin.payment.model.PaymentType;
import com.coliving.user.contract.model.ContractStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractBillingListener {

    private final PaymentRepositoryPort paymentRepositoryPort;

    /**
     * 계약 상태가 ACTIVE로 변경될 때(체결/직접등록) 첫 달 월세 인보이스를 자동으로 생성합니다.
     */
    @EventListener
    @Transactional
    public void onContractActivated(ContractStatusChangedByAdminEvent event) {
        if (event.getNewStatus() != ContractStatus.ACTIVE) {
            return;
        }

        log.info("Contract activated detected for contractId={}. Creating initial rent invoice.", event.getContractId());

        try {
            LocalDate today = LocalDate.now();
            int year = today.getYear();
            int month = today.getMonthValue();

            // 중복 생성 방지
            if (paymentRepositoryPort.existsByContractAndMonth(event.getContractId(), PaymentType.RENT, year, month)) {
                log.info("Initial invoice already exists for contractId={} in {}/{}", event.getContractId(), year, month);
                return;
            }

            Payment invoice = new Payment();
            invoice.setContractId(event.getContractId());
            invoice.setUserId(event.getUserId());
            invoice.setType(PaymentType.RENT);
            invoice.setAmount(event.getMonthlyRent());
            invoice.setStatus(PaymentStatus.PENDING);
            invoice.setBillingDate(today);

            paymentRepositoryPort.save(invoice);
            log.info("Initial rent invoice created for contractId={}, amount={}", event.getContractId(), event.getMonthlyRent());
        } catch (Exception e) {
            log.error("Failed to create initial invoice for contract {}: {}", event.getContractId(), e.getMessage());
        }
    }
}
