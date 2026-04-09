package com.coliving.admin.space.adapter.out.jpa;

import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SpaceJpaRepository extends JpaRepository<SpaceEntity, Long> {

    boolean existsByName(String name);

    Optional<SpaceEntity> findByName(String name);

    @Query(value = "SELECT s FROM SpaceEntity s " +
                   "WHERE (:type IS NULL OR s.type = :type) " +
                   "AND (:status IS NULL OR s.status = :status)",
           countQuery = "SELECT COUNT(s) FROM SpaceEntity s " +
                        "WHERE (:type IS NULL OR s.type = :type) " +
                        "AND (:status IS NULL OR s.status = :status)")
    Page<SpaceEntity> findSpacesWithFilter(@Param("type") SpaceType type,
                                           @Param("status") SpaceStatus status,
                                           Pageable pageable);

    @Query(value = "SELECT s FROM SpaceEntity s " +
                    "LEFT JOIN FETCH s.privateDetail " +
                    "WHERE s.type = :type AND s.status = :status",
            countQuery = "SELECT COUNT(s) FROM SpaceEntity s " +
                    "WHERE s.type = :type AND s.status = :status")
    Page<SpaceEntity> findByTypeAndStatus(@Param("type") SpaceType type,
                                          @Param("status") SpaceStatus status,
                                          Pageable pageable);

    @Query(value = "SELECT s.* FROM spaces s " +
                    "LEFT JOIN private_space_details pd ON s.space_id = pd.space_id AND pd.deleted_at IS NULL " +
                    "WHERE s.type = 'PRIVATE' AND s.status = 'AVAILABLE' " +
                    "AND s.deleted_at IS NULL " +
                    "AND (CAST(:roomTypeId AS BIGINT) IS NULL OR pd.room_type_id = CAST(:roomTypeId AS BIGINT)) " +
                    "AND (CAST(:minRent AS NUMERIC) IS NULL OR pd.monthly_rent >= CAST(:minRent AS NUMERIC)) " +
                    "AND (CAST(:maxRent AS NUMERIC) IS NULL OR pd.monthly_rent <= CAST(:maxRent AS NUMERIC)) " +
                    "AND (CAST(:floor AS INTEGER) IS NULL OR s.floor = CAST(:floor AS INTEGER))",
            countQuery = "SELECT COUNT(*) FROM spaces s " +
                    "LEFT JOIN private_space_details pd ON s.space_id = pd.space_id AND pd.deleted_at IS NULL " +
                    "WHERE s.type = 'PRIVATE' AND s.status = 'AVAILABLE' " +
                    "AND s.deleted_at IS NULL " +
                    "AND (CAST(:roomTypeId AS BIGINT) IS NULL OR pd.room_type_id = CAST(:roomTypeId AS BIGINT)) " +
                    "AND (CAST(:minRent AS NUMERIC) IS NULL OR pd.monthly_rent >= CAST(:minRent AS NUMERIC)) " +
                    "AND (CAST(:maxRent AS NUMERIC) IS NULL OR pd.monthly_rent <= CAST(:maxRent AS NUMERIC)) " +
                    "AND (CAST(:floor AS INTEGER) IS NULL OR s.floor = CAST(:floor AS INTEGER))",
            nativeQuery = true)
    Page<SpaceEntity> findAvailableRoomsWithFilter(
            @Param("roomTypeId") Long roomTypeId,
            @Param("minRent") BigDecimal minRent,
            @Param("maxRent") BigDecimal maxRent,
            @Param("floor") Integer floor,
            Pageable pageable);

    List<SpaceEntity> findByFloor(Integer floor);

    @Query(value = "SELECT DISTINCT s FROM SpaceEntity s " +
                    "LEFT JOIN FETCH s.commonDetail " +
                    "LEFT JOIN FETCH s.images " +
                    "WHERE s.type = :type AND s.status <> :excludeStatus " +
                    "ORDER BY s.name")
    List<SpaceEntity> findByTypeAndStatusNot(@Param("type") SpaceType type,
                                             @Param("excludeStatus") SpaceStatus excludeStatus);
}

