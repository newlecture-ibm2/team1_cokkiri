package com.coliving.admin.space.application.port.out;

import com.coliving.admin.space.model.AdminRoomType;

import java.util.List;
import java.util.Optional;

public interface AdminRoomTypeRepositoryPort {
    List<AdminRoomType> findAll();
    Optional<AdminRoomType> findById(Long roomTypeId);
    boolean existsByCode(String code);
    AdminRoomType save(AdminRoomType roomType);
    void delete(Long roomTypeId);
    boolean isUsedInSpaces(Long roomTypeId);
}
