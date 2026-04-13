package com.coliving.admin.payment.adapter.in.scheduler;

import com.coliving.admin.payment.application.port.in.AdminInvoiceBatchUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class InvoiceBatchScheduler {

    private final AdminInvoiceBatchUseCase adminInvoiceBatchUseCase;

    /**
     * 매달 1일 00:00:00에 실행
     * ShedLock을 사용하여 여러 서버 인스턴스에서 중복 실행을 방지함
     */
    @Scheduled(cron = "0 0 0 1 * *")
    @SchedulerLock(
        name = "generateMonthlyInvoicesLock", 
        lockAtLeastFor = "1m", 
        lockAtMostFor = "10m"
    )
    public void runMonthlyInvoiceBatch() {
        log.info("Scheduled task: runMonthlyInvoiceBatch started");
        LocalDate today = LocalDate.now();
        int count = adminInvoiceBatchUseCase.generateMonthlyInvoices(today);
        log.info("Scheduled task: runMonthlyInvoiceBatch finished. Generated {} invoices.", count);
    }
}
