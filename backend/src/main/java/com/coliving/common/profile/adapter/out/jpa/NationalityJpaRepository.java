package com.coliving.common.profile.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NationalityJpaRepository extends JpaRepository<NationalityEntity, String> {
}
