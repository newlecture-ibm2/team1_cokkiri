package com.coliving.admin.payment.application.port.in;

import java.time.LocalDate;

/**
 * 월 결제 명세서(Invoice) 총합 생성 유스케이스
 */
public interface AdminInvoiceBatchUseCase {
    
    /**
     * 특정 날짜를 기준으로 이번 달 인보이스 생성 배치를 실행합니다.
     * @param referenceDate 기준 날짜 (보통 매달 1일)
     * @return 생성된 인보이스 개수
     */
    int generateMonthlyInvoices(LocalDate referenceDate);
}
