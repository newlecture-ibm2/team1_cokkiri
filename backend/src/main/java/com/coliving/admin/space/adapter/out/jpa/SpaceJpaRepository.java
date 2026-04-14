package com.coliving.admin.space.adapter.out.jpa;

import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SpaceJpaRepository extends JpaRepository<SpaceEntity, Long> {

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM SpaceEntity s WHERE s.name = :name")
    boolean existsByName(@Param("name") String name);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM spaces WHERE name = :name AND deleted_at IS NOT NULL", nativeQuery = true)
    boolean existsSoftDeletedByName(@Param("name") String name);

    @Modifying
    @Query(value = "DELETE FROM private_space_details WHERE space_id IN (SELECT space_id FROM spaces WHERE name = :name AND deleted_at IS NOT NULL)", nativeQuery = true)
    void hardDeletePrivateDetailsByName(@Param("name") String name);

    @Modifying
    @Query(value = "DELETE FROM common_space_details WHERE space_id IN (SELECT space_id FROM spaces WHERE name = :name AND deleted_at IS NOT NULL)", nativeQuery = true)
    void hardDeleteCommonDetailsByName(@Param("name") String name);

    @Modifying
    @Query(value = "DELETE FROM space_images WHERE space_id IN (SELECT space_id FROM spaces WHERE name = :name AND deleted_at IS NOT NULL)", nativeQuery = true)
    void hardDeleteImagesByName(@Param("name") String name);

    @Modifying
    @Query(value = "DELETE FROM spaces WHERE name = :name AND deleted_at IS NOT NULL", nativeQuery = true)
    void hardDeleteSoftDeletedByName(@Param("name") String name);

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

    @Query(value = "SELECT s FROM SpaceEntity s " +
                    "LEFT JOIN FETCH s.privateDetail " +
                    "WHERE s.type = :type",
            countQuery = "SELECT COUNT(s) FROM SpaceEntity s " +
                    "WHERE s.type = :type")
    Page<SpaceEntity> findByType(@Param("type") SpaceType type, Pageable pageable);

    @Query(value = "SELECT s FROM SpaceEntity s " +
                    "JOIN FETCH s.privateDetail pd " +
                    "WHERE s.type = 'PRIVATE' " +
                    "AND (:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "AND (:roomTypeId IS NULL OR pd.roomType.id = :roomTypeId) " +
                    "AND (:minRent IS NULL OR pd.monthlyRent >= :minRent) " +
                    "AND (:maxRent IS NULL OR pd.monthlyRent <= :maxRent) " +
                    "AND (:floor IS NULL OR s.floor = :floor)",
            countQuery = "SELECT COUNT(s) FROM SpaceEntity s " +
                    "JOIN s.privateDetail pd " +
                    "WHERE s.type = 'PRIVATE' " +
                    "AND (:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "AND (:roomTypeId IS NULL OR pd.roomType.id = :roomTypeId) " +
                    "AND (:minRent IS NULL OR pd.monthlyRent >= :minRent) " +
                    "AND (:maxRent IS NULL OR pd.monthlyRent <= :maxRent) " +
                    "AND (:floor IS NULL OR s.floor = :floor)")
    Page<SpaceEntity> findRoomsWithFilter(
            @Param("keyword") String keyword,
            @Param("roomTypeId") Long roomTypeId,
            @Param("minRent") BigDecimal minRent,
            @Param("maxRent") BigDecimal maxRent,
            @Param("floor") Integer floor,
            Pageable pageable);

    List<SpaceEntity> findByFloor(Integer floor);

    @Query(value = "SELECT DISTINCT s FROM SpaceEntity s " +
                    "LEFT JOIN FETCH s.commonDetail " +
                    "LEFT JOIN FETCH s.images " +
                    "WHERE s.type = :type " +
                    "ORDER BY s.name")
    List<SpaceEntity> findByTypeFetchAll(@Param("type") SpaceType type);
}

