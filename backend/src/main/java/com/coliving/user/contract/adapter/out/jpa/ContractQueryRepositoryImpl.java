package com.coliving.user.contract.adapter.out.jpa;

import com.coliving.user.contract.model.ContractStatus;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import static com.coliving.user.contract.adapter.out.jpa.QContractEntity.contractEntity;
import static com.coliving.admin.payment.adapter.out.jpa.QPaymentEntity.paymentEntity;

/**
 * Contract QueryDSL Repository Implementation
 * LAZY 전략 기반 조회 시 불필요한 N+1 쿼리를 방지하기 위해 Fetch Join을 적용합니다. (DoD 만족)
 */
@Repository
@RequiredArgsConstructor
public class ContractQueryRepositoryImpl implements ContractQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<ContractEntity> searchContracts(Long userId, List<ContractStatus> statuses, LocalDate startDate, LocalDate endDate) {
        return queryFactory
                .selectFrom(contractEntity)
                // Payments를 LAZY 로딩 전략임에도 불구하고 N+1 문제없이 조회하기 위해 fetchJoin을 사용합니다.
                .leftJoin(contractEntity.payments, paymentEntity).fetchJoin()
                .where(
                        userIdEq(userId),
                        statusIn(statuses),
                        startDateAfter(startDate),
                        endDateBefore(endDate)
                )
                .orderBy(contractEntity.createdAt.desc())
                .fetch();
    }

    private BooleanExpression userIdEq(Long userId) {
        return userId != null ? contractEntity.userId.eq(userId) : null;
    }

    private BooleanExpression statusIn(List<ContractStatus> statuses) {
        return (statuses != null && !statuses.isEmpty()) ? contractEntity.status.in(statuses) : null;
    }

    private BooleanExpression startDateAfter(LocalDate startDate) {
        return startDate != null ? contractEntity.startDate.goe(startDate) : null;
    }

    private BooleanExpression endDateBefore(LocalDate endDate) {
        return endDate != null ? contractEntity.endDate.loe(endDate) : null;
    }
}
