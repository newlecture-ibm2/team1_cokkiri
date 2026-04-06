package com.coliving.admin.space.adapter.out.persistence;

import com.coliving.admin.space.application.port.out.AdminRoomTypeRepositoryPort;
import com.coliving.admin.space.model.AdminRoomType;
import com.coliving.user.room.adapter.out.jpa.PrivateSpaceDetailJpaRepository;
import com.coliving.user.room.adapter.out.jpa.RoomTypeEntity;
import com.coliving.user.room.adapter.out.jpa.RoomTypeJpaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminRoomTypePersistenceAdapter implements AdminRoomTypeRepositoryPort {

    private final RoomTypeJpaRepository roomTypeJpaRepository;
    private final PrivateSpaceDetailJpaRepository privateSpaceDetailJpaRepository;

    @Override
    public List<AdminRoomType> findAll() {
        return roomTypeJpaRepository.findAll().stream()
                .map(this::toModel)
                .toList();
    }

    @Override
    public Optional<AdminRoomType> findById(Long roomTypeId) {
        return roomTypeJpaRepository.findById(roomTypeId).map(this::toModel);
    }

    @Override
    public boolean existsByCode(String code) {
        return roomTypeJpaRepository.findByCode(code).isPresent();
    }

    @Override
    public AdminRoomType save(AdminRoomType roomType) {
        RoomTypeEntity entity;
        if (roomType.getRoomTypeId() != null) {
            entity = roomTypeJpaRepository.findById(roomType.getRoomTypeId()).orElseThrow();
            entity.update(roomType.getName());
        } else {
            entity = RoomTypeEntity.builder()
                    .code(roomType.getCode())
                    .name(roomType.getName())
                    .isSystemDefault(roomType.getIsSystemDefault())
                    .build();
        }
        return toModel(roomTypeJpaRepository.save(entity));
    }

    @Override
    public void delete(Long roomTypeId) {
        RoomTypeEntity entity = roomTypeJpaRepository.findById(roomTypeId).orElseThrow();
        entity.softDelete();
        roomTypeJpaRepository.save(entity);
    }

    @Override
    public boolean isUsedInSpaces(Long roomTypeId) {
        return privateSpaceDetailJpaRepository.existsByRoomType_Id(roomTypeId);
    }

    private AdminRoomType toModel(RoomTypeEntity entity) {
        return AdminRoomType.builder()
                .roomTypeId(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .isSystemDefault(entity.getIsSystemDefault())
                .build();
    }
}
