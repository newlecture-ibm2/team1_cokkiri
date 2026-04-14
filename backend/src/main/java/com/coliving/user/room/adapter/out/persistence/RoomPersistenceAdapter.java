package com.coliving.user.room.adapter.out.persistence;

import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceImageEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.user.room.application.port.out.RoomRepositoryPort;
import com.coliving.user.room.model.Room;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RoomPersistenceAdapter implements RoomRepositoryPort {

    private final SpaceJpaRepository spaceJpaRepository;
    private final com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository contractJpaRepository;

    @Override
    public Page<Room> findAvailablePrivateSpaces(Pageable pageable) {
        return spaceJpaRepository
                .findByType(SpaceType.PRIVATE, pageable)
                .map(this::toRoom);
    }

    @Override
    public Page<Room> findAvailableRoomsWithFilter(String keyword, Long roomTypeId, BigDecimal minRent,
                                                    BigDecimal maxRent, Integer floor, Pageable pageable) {
        return spaceJpaRepository
                .findRoomsWithFilter(keyword, roomTypeId, minRent, maxRent, floor, pageable)
                .map(this::toRoom);
    }

    @Override
    public Optional<Room> findById(Long spaceId) {
        return spaceJpaRepository.findById(spaceId)
                .filter(entity -> entity.getType() == SpaceType.PRIVATE)
                .map(this::toRoomDetail);
    }

    private Room toRoom(SpaceEntity entity) {
        String thumbnailUrl = entity.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                .map(SpaceImageEntity::getImageUrl)
                .findFirst()
                .orElseGet(() -> entity.getImages().stream()
                        .findFirst()
                        .map(SpaceImageEntity::getImageUrl)
                        .orElse(null));

        Room.RoomBuilder builder = Room.builder()
                .spaceId(entity.getSpaceId())
                .name(entity.getName())
                .status(entity.getStatus())
                .floor(entity.getFloor())
                .area(entity.getArea())
                .description(entity.getDescription())
                .amenities(parseAmenities(entity.getAmenities()))
                .thumbnailUrl(thumbnailUrl);

        if (entity.getPrivateDetail() != null) {
            builder.roomTypeId(entity.getPrivateDetail().getRoomType().getId())
                    .roomTypeName(entity.getPrivateDetail().getRoomType().getName())
                    .roomCount(entity.getPrivateDetail().getRoomCount())
                    .bathroomCount(entity.getPrivateDetail().getBathroomCount())
                    .direction(entity.getPrivateDetail().getDirection())
                    .deposit(entity.getPrivateDetail().getDeposit())
                    .monthlyRent(entity.getPrivateDetail().getMonthlyRent())
                    .maintenanceFee(entity.getPrivateDetail().getMaintenanceFee())
                    .parkingAvailable(entity.getPrivateDetail().getParkingAvailable());
        }

        return builder.build();
    }

    private Room toRoomDetail(SpaceEntity entity) {
        List<Room.SpaceImage> images = entity.getImages().stream()
                .map(img -> Room.SpaceImage.builder()
                        .spaceImageId(img.getSpaceImageId())
                        .imageUrl(img.getImageUrl())
                        .imageType(img.getImageType())
                        .sortOrder(img.getSortOrder())
                        .isThumbnail(img.getIsThumbnail())
                        .build())
                .toList();

        Room room = toRoom(entity);

        // OCCUPIED일 때 현재 활성 계약 종료일 조회 (READ 전용 — 도메인 협업 룰 §1 허용)
        LocalDate contractEndDate = null;
        if (entity.getStatus() == SpaceStatus.OCCUPIED) {
            contractEndDate = contractJpaRepository
                    .findBySpaceIdAndStatus(entity.getSpaceId(),
                            com.coliving.user.contract.model.ContractStatus.ACTIVE)
                    .map(com.coliving.user.contract.adapter.out.jpa.ContractEntity::getEndDate)
                    .orElse(null);
        }

        return Room.builder()
                .spaceId(room.getSpaceId())
                .name(room.getName())
                .status(room.getStatus())
                .floor(room.getFloor())
                .area(room.getArea())
                .description(room.getDescription())
                .amenities(room.getAmenities())
                .roomTypeId(room.getRoomTypeId())
                .roomTypeName(room.getRoomTypeName())
                .roomCount(room.getRoomCount())
                .bathroomCount(room.getBathroomCount())
                .direction(room.getDirection())
                .deposit(room.getDeposit())
                .monthlyRent(room.getMonthlyRent())
                .maintenanceFee(room.getMaintenanceFee())
                .parkingAvailable(room.getParkingAvailable())
                .thumbnailUrl(room.getThumbnailUrl())
                .images(images)
                .contractEndDate(contractEndDate)
                .build();
    }

    private List<String> parseAmenities(String amenitiesJson) {
        if (amenitiesJson == null || amenitiesJson.isBlank()) {
            return Collections.emptyList();
        }
        String trimmed = amenitiesJson.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        if (trimmed.isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(trimmed.split(","))
                .map(s -> s.trim().replaceAll("^\"|\"$", ""))
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
