package com.coliving.user.room.adapter.out.persistence;

import com.coliving.user.room.adapter.out.jpa.SpaceEntity;
import com.coliving.user.room.adapter.out.jpa.SpaceImageEntity;
import com.coliving.user.room.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.user.room.application.port.out.RoomRepositoryPort;
import com.coliving.user.room.model.*;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RoomPersistenceAdapter implements RoomRepositoryPort {

    private final SpaceJpaRepository spaceJpaRepository;

    @Override
    public Page<Room> findAvailablePrivateSpaces(Pageable pageable) {
        return spaceJpaRepository
                .findByTypeAndStatus(SpaceType.PRIVATE, SpaceStatus.AVAILABLE, pageable)
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
                .orElse(null);

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
            builder.roomType(entity.getPrivateDetail().getRoomType())
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

        return Room.builder()
                .spaceId(room.getSpaceId())
                .name(room.getName())
                .status(room.getStatus())
                .floor(room.getFloor())
                .area(room.getArea())
                .description(room.getDescription())
                .amenities(room.getAmenities())
                .roomType(room.getRoomType())
                .roomCount(room.getRoomCount())
                .bathroomCount(room.getBathroomCount())
                .direction(room.getDirection())
                .deposit(room.getDeposit())
                .monthlyRent(room.getMonthlyRent())
                .maintenanceFee(room.getMaintenanceFee())
                .parkingAvailable(room.getParkingAvailable())
                .thumbnailUrl(room.getThumbnailUrl())
                .images(images)
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
