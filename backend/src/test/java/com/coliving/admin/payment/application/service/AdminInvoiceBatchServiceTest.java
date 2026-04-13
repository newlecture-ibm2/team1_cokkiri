package com.coliving.admin.payment.application.service;

import com.coliving.admin.contract.application.port.out.AdminContractRepositoryPort;
import com.coliving.admin.contract.application.result.AdminContractListResult;
import com.coliving.admin.payment.application.port.out.PaymentRepositoryPort;
import com.coliving.admin.payment.model.Payment;
import com.coliving.admin.payment.model.PaymentType;
import com.coliving.user.contract.model.ContractStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminInvoiceBatchServiceTest {

    @Mock
    private AdminContractRepositoryPort contractRepositoryPort;

    @Mock
    private PaymentRepositoryPort paymentRepositoryPort;

    @InjectMocks
    private AdminInvoiceBatchService adminInvoiceBatchService;

    @Test
    @DisplayName("매달 1일 활성 계약에 대해 월세 인보이스가 정확하게 생성되어야 한다")
    void generateMonthlyInvoices_success() {
        // given
        LocalDate referenceDate = LocalDate.of(2026, 4, 1);
        
        AdminContractListResult contract1 = createContract(1L, 101L, "500000");
        AdminContractListResult contract2 = createContract(2L, 102L, "600000");
        
        given(contractRepositoryPort.findAllContracts(ContractStatus.ACTIVE))
                .willReturn(List.of(contract1, contract2));
        
        // 중복 체크: 1번은 이미 존재, 2번은 없음
        given(paymentRepositoryPort.existsByContractAndMonth(eq(1L), eq(PaymentType.RENT), anyInt(), anyInt()))
                .willReturn(true);
        given(paymentRepositoryPort.existsByContractAndMonth(eq(2L), eq(PaymentType.RENT), anyInt(), anyInt()))
                .willReturn(false);

        // when
        int count = adminInvoiceBatchService.generateMonthlyInvoices(referenceDate);

        // then
        assertThat(count).isEqualTo(1); // 2번 계약만 생성되어야 함
        
        verify(paymentRepositoryPort, times(1)).save(argThat(payment -> 
            payment.getContractId().equals(2L) && 
            payment.getAmount().compareTo(new BigDecimal("600000")) == 0 &&
            payment.getType() == PaymentType.RENT
        ));
    }

    private AdminContractListResult createContract(Long id, Long userId, String rent) {
        return AdminContractListResult.builder()
                .contractId(id)
                .userId(userId)
                .monthlyRent(new BigDecimal(rent))
                .status(ContractStatus.ACTIVE)
                .build();
    }
}
