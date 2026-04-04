package com.coliving.user.contract.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.stream.Stream;

/**
 * ContractStatus <-> String DB 컨버터
 * PENDING, APPROVED, ACTIVE, EXPIRED 등을 순수 문자열로 저장
 */
@Converter(autoApply = true)
public class ContractStatusConverter implements AttributeConverter<ContractStatus, String> {

    @Override
    public String convertToDatabaseColumn(ContractStatus status) {
        if (status == null) {
            return null;
        }
        return status.name();
    }

    @Override
    public ContractStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return Stream.of(ContractStatus.values())
                .filter(c -> c.name().equals(dbData))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown status: " + dbData));
    }
}
