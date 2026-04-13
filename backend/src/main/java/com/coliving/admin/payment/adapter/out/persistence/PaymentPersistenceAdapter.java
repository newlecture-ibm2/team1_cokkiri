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
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentPersistenceAdapter implements PaymentRepositoryPort {

    private final PaymentJpaRepository paymentJpaRepository;
    private final ContractJpaRepository contractJpaRepository;
    private final com.coliving.common.auth.adapter.out.jpa.UserJpaRepository userJpaRepository;

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
        return findById(savedEntity.getPaymentId()).orElse(mapToDomain(savedEntity, null));
    }

    @Override
    public Optional<Payment> findById(Long paymentId) {
        return paymentJpaRepository.findById(paymentId)
                .map(e -> {
                    var user = userJpaRepository.findById(e.getUserId()).orElse(null);
                    return mapToDomain(e, user);
                });
    }

    @Override
    public List<Payment> findAll() {
        List<PaymentEntity> entities = paymentJpaRepository.findAll();
        return mapEntitiesToDomainWithUsers(entities);
    }

    @Override
    public List<Payment> findByUserId(Long userId) {
        List<PaymentEntity> entities = paymentJpaRepository.findByUserId(userId);
        return mapEntitiesToDomainWithUsers(entities);
    }

    private List<Payment> mapEntitiesToDomainWithUsers(List<PaymentEntity> entities) {
        Set<Long> userIds = entities.stream()
                .map(PaymentEntity::getUserId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        
        Map<Long, com.coliving.common.auth.adapter.out.jpa.UserEntity> userMap = java.util.Collections.emptyMap();
        if (!userIds.isEmpty()) {
            userMap = userJpaRepository.findAllById(userIds).stream()
                        .filter(u -> u.getUserId() != null)
                        .collect(Collectors.toMap(
                                com.coliving.common.auth.adapter.out.jpa.UserEntity::getUserId, 
                                u -> u,
                                (existing, replacement) -> existing // Handle duplicates gracefully
                        ));
        }

        final Map<Long, com.coliving.common.auth.adapter.out.jpa.UserEntity> finalUserMap = userMap;
        return entities.stream()
                .map(e -> mapToDomain(e, finalUserMap.get(e.getUserId())))
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByContractAndMonth(Long contractId, com.coliving.admin.payment.model.PaymentType type, int year, int month) {
        return paymentJpaRepository.existsByContractAndTypeAndMonth(contractId, type, year, month);
    }

    private Payment mapToDomain(PaymentEntity entity, com.coliving.common.auth.adapter.out.jpa.UserEntity user) {
        Payment domain = new Payment();
        domain.setPaymentId(entity.getPaymentId());
        domain.setContractId(entity.getContract() != null ? entity.getContract().getContractId() : null);
        domain.setReservationId(entity.getReservationId());
        domain.setUserId(entity.getUserId());
        
        if (user != null) {
            domain.setUserName(user.getName());
            domain.setLoginId(user.getLoginId());
        }
        
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
