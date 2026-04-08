package com.coliving.admin.payment.adapter.out.persistence;

import com.coliving.admin.payment.adapter.out.jpa.PaymentEntity;
import com.coliving.admin.payment.adapter.out.jpa.PaymentJpaRepository;
import com.coliving.admin.payment.application.port.out.PaymentRepositoryPort;
import com.coliving.admin.payment.model.Payment;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentPersistenceAdapter implements PaymentRepositoryPort {

    private final PaymentJpaRepository paymentJpaRepository;
    private final ContractJpaRepository contractJpaRepository;

    @Override
    public Payment save(Payment payment) {
        ContractEntity contractEntity = null;
        if (payment.getContractId() != null) {
            contractEntity = contractJpaRepository.findById(payment.getContractId())
                    .orElseThrow(() -> new IllegalArgumentException("Contract not found"));
        }

        PaymentEntity paymentEntity = PaymentEntity.builder()
                .contract(contractEntity)
                .reservationId(payment.getReservationId())
                .userId(payment.getUserId())
                .type(payment.getType())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .billingDate(payment.getBillingDate())
                .paidDate(payment.getPaidDate())
                .build();

        if (payment.getPaymentId() != null) {
             // For update, we might need a different approach or a mapping that handles existing ID.
             // But Rule 1-7 says use save explicitly for update as well.
             paymentEntity = paymentJpaRepository.findById(payment.getPaymentId())
                     .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
             
             // Update fields
             if (payment.getStatus() != null) {
                 if (payment.getStatus() == com.coliving.admin.payment.model.PaymentStatus.PAID) {
                      paymentEntity.markPaid(payment.getPaymentMethod(), payment.getPaidDate());
                 } else if (payment.getStatus() == com.coliving.admin.payment.model.PaymentStatus.PENDING) {
                      paymentEntity.markPending();
                 }
             }
        }

        PaymentEntity savedEntity = paymentJpaRepository.save(paymentEntity);
        return mapToDomain(savedEntity);
    }

    @Override
    public Optional<Payment> findById(Long paymentId) {
        return paymentJpaRepository.findById(paymentId)
                .map(this::mapToDomain);
    }

    @Override
    public List<Payment> findAll() {
        return paymentJpaRepository.findAll().stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Payment> findByUserId(Long userId) {
        return paymentJpaRepository.findByUserId(userId).stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    private Payment mapToDomain(PaymentEntity entity) {
        Payment domain = new Payment();
        domain.setPaymentId(entity.getPaymentId());
        domain.setContractId(entity.getContract() != null ? entity.getContract().getContractId() : null);
        domain.setReservationId(entity.getReservationId());
        domain.setUserId(entity.getUserId());
        domain.setType(entity.getType());
        domain.setAmount(entity.getAmount());
        domain.setStatus(entity.getStatus());
        domain.setPaymentMethod(entity.getPaymentMethod());
        domain.setBillingDate(entity.getBillingDate());
        domain.setPaidDate(entity.getPaidDate());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());
        domain.setDeletedAt(entity.getDeletedAt());
        return domain;
    }
}
