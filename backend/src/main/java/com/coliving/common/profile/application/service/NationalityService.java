package com.coliving.common.profile.application.service;

import com.coliving.common.profile.application.port.in.ViewNationalityListUseCase;
import com.coliving.common.profile.application.port.out.NationalityRepositoryPort;
import com.coliving.common.profile.application.result.NationalityListResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NationalityService implements ViewNationalityListUseCase {

    private final NationalityRepositoryPort nationalityRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<NationalityListResult> execute() {
        return nationalityRepositoryPort.findAll().stream()
                .map(entity -> NationalityListResult.builder()
                        .code(entity.getCode())
                        .nameKo(entity.getNameKo())
                        .nameEn(entity.getNameEn())
                        .nameNative(entity.getNameNative())
                        .build())
                .toList();
    }
}
