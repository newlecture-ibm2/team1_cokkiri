package com.coliving.admin.space.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomTypeJpaRepository extends JpaRepository<RoomTypeEntity, Long> {
    Optional<RoomTypeEntity> findByCode(String code);
}
