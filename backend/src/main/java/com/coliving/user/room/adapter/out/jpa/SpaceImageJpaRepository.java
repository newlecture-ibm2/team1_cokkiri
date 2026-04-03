package com.coliving.user.room.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SpaceImageJpaRepository extends JpaRepository<SpaceImageEntity, Long> {

    List<SpaceImageEntity> findBySpace_SpaceId(Long spaceId);

    @Modifying
    @Query("UPDATE SpaceImageEntity si SET si.isThumbnail = false " +
            "WHERE si.space.spaceId = :spaceId AND si.isThumbnail = true")
    void clearThumbnailBySpaceId(@Param("spaceId") Long spaceId);
}
