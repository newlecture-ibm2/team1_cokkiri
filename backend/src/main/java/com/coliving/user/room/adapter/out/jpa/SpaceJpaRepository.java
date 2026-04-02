package com.coliving.user.room.adapter.out.jpa;

import com.coliving.user.room.model.SpaceStatus;
import com.coliving.user.room.model.SpaceType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SpaceJpaRepository extends JpaRepository<SpaceEntity, Long> {

    boolean existsByName(String name);

    Optional<SpaceEntity> findByName(String name);

    @Query("SELECT s FROM SpaceEntity s " +
            "LEFT JOIN FETCH s.privateDetail " +
            "WHERE s.type = :type AND s.status = :status")
    Page<SpaceEntity> findByTypeAndStatus(@Param("type") SpaceType type,
                                          @Param("status") SpaceStatus status,
                                          Pageable pageable);

    List<SpaceEntity> findByFloor(Integer floor);
}
