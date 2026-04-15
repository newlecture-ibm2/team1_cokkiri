package com.coliving.common.profile.adapter.out.persistence;

import com.coliving.common.profile.adapter.out.jpa.NationalityEntity;
import com.coliving.common.profile.adapter.out.jpa.NationalityJpaRepository;
import com.coliving.common.profile.application.port.out.NationalityRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NationalityPersistenceAdapter implements NationalityRepositoryPort {

    private final NationalityJpaRepository nationalityJpaRepository;

    @Override
    public List<NationalityEntity> findAll() {
        return nationalityJpaRepository.findAll();
    }
}
