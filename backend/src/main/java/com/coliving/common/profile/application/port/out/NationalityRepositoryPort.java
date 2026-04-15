package com.coliving.common.profile.application.port.out;

import com.coliving.common.profile.adapter.out.jpa.NationalityEntity;
import java.util.List;

public interface NationalityRepositoryPort {
    List<NationalityEntity> findAll();
}
