package com.coliving.user.experience.adapter.out.persistence;

import com.coliving.admin.space.adapter.out.jpa.CommonSpaceDetailEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceImageEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;
import com.coliving.user.experience.application.port.out.ExperienceRepositoryPort;
import com.coliving.user.experience.model.CommonSpace;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ExperiencePersistenceAdapter implements ExperienceRepositoryPort {

    private final SpaceJpaRepository spaceJpaRepository;

    @Override
    public List<CommonSpace> findAllCommonSpaces() {
        List<SpaceEntity> entities = spaceJpaRepository.findByTypeAndStatusNot(
                SpaceType.COMMON, SpaceStatus.MAINTENANCE);

        return entities.stream()
                .map(this::toCommonSpace)
                .toList();
    }

    @Override
    public Optional<CommonSpace> findCommonSpaceById(Long spaceId) {
        return spaceJpaRepository.findById(spaceId)
                .filter(entity -> entity.getType() == SpaceType.COMMON && entity.getStatus() != SpaceStatus.MAINTENANCE)
                .map(this::toCommonSpace);
    }

    private CommonSpace toCommonSpace(SpaceEntity entity) {
        String thumbnailUrl = entity.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                .map(SpaceImageEntity::getImageUrl)
                .findFirst()
                .orElse(null);

        List<CommonSpace.SpaceImage> images = entity.getImages().stream()
                .map(img -> CommonSpace.SpaceImage.builder()
                        .spaceImageId(img.getSpaceImageId())
                        .imageUrl(img.getImageUrl())
                        .imageType(img.getImageType())
                        .sortOrder(img.getSortOrder())
                        .isThumbnail(img.getIsThumbnail())
                        .build())
                .toList();

        CommonSpaceDetailEntity detail = entity.getCommonDetail();

        return CommonSpace.builder()
                .spaceId(entity.getSpaceId())
                .name(entity.getName())
                .status(entity.getStatus())
                .floor(entity.getFloor())
                .area(entity.getArea())
                .description(entity.getDescription())
                .amenities(parseAmenities(entity.getAmenities()))
                .maxCapacity(detail != null ? detail.getMaxCapacity() : null)
                .operatingHours(detail != null ? detail.getOperatingHours() : null)
                .isReservable(detail != null ? detail.getIsReservable() : null)
                .usageFee(detail != null ? detail.getUsageFee() : null)
                .thumbnailUrl(thumbnailUrl)
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
