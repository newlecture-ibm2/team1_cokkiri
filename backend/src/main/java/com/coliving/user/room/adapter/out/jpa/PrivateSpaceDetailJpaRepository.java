package com.coliving.user.room.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PrivateSpaceDetailJpaRepository extends JpaRepository<PrivateSpaceDetailEntity, Long> {
    boolean existsByRoomType_Id(Long roomTypeId);
}
