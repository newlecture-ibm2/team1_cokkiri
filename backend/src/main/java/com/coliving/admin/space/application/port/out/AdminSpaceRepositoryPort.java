package com.coliving.admin.space.application.port.out;

import com.coliving.admin.space.model.AdminSpace;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * 관리자 공간 관리 Repository Port
 */
public interface AdminSpaceRepositoryPort {

    AdminSpace save(AdminSpace adminSpace);

    Optional<AdminSpace> findById(Long spaceId);

    Page<AdminSpace> findAll(Pageable pageable);

    boolean existsByName(String name);

    void softDelete(Long spaceId);

    List<AdminSpace> findByFloor(Integer floor);

    void updatePositions(List<AdminSpace> spaces);

    void saveImage(Long spaceId, AdminSpace.SpaceImage image);
}
