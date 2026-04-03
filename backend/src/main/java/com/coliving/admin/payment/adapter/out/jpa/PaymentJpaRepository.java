package com.coliving.admin.payment.adapter.out.jpa;

import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.admin.payment.model.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Payment JPA Repository
 */
public interface PaymentJpaRepository extends JpaRepository<PaymentEntity, Long> {

    /**
     * 특정 계약의 결제 목록 조회
     */
    List<PaymentEntity> findByContract_ContractIdOrderByBillingDateDesc(Long contractId);

    /**
     * 특정 유저의 결제 목록 조회 (최신순)
     */
    List<PaymentEntity> findByUserIdOrderByBillingDateDesc(Long userId);

    /**
     * 특정 유저의 특정 상태 결제 목록
     */
    List<PaymentEntity> findByUserIdAndStatus(Long userId, PaymentStatus status);

    /**
     * 특정 계약에 미납(UNPAID) 결제가 있는지 확인
     */
    boolean existsByContract_ContractIdAndStatus(Long contractId, PaymentStatus status);

    /**
     * 특정 예약의 결제 조회
     */
    List<PaymentEntity> findByReservationId(Long reservationId);

    /**
     * 특정 기간 내 청구된 결제 목록
     */
    List<PaymentEntity> findByBillingDateBetween(LocalDate from, LocalDate to);

    /**
     * 특정 유형 + 상태 결제 목록
     */
    List<PaymentEntity> findByTypeAndStatus(PaymentType type, PaymentStatus status);
}
