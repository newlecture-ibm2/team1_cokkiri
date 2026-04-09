package com.coliving.admin.space.adapter.out.persistence;

import com.coliving.admin.space.application.port.out.AdminSpaceRepositoryPort;
import com.coliving.admin.space.model.AdminSpace;
import com.coliving.admin.space.adapter.out.jpa.*;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin 공간 PersistenceAdapter
 * user/room/의 JpaRepository를 DI 받아 사용 (Admin 모듈은 jpa/ 폴더 없음)
 */
@Component
@RequiredArgsConstructor
public class AdminSpacePersistenceAdapter implements AdminSpaceRepositoryPort {

    private final SpaceJpaRepository spaceJpaRepository;
    private final SpaceImageJpaRepository spaceImageJpaRepository;
    private final PrivateSpaceDetailJpaRepository privateSpaceDetailJpaRepository;
    private final CommonSpaceDetailJpaRepository commonSpaceDetailJpaRepository;
    private final RoomTypeJpaRepository roomTypeJpaRepository;

    @Override
    public AdminSpace save(AdminSpace adminSpace) {
        if (adminSpace.getSpaceId() != null) {
            // === 수정(Update) ===
            SpaceEntity existing = spaceJpaRepository.findById(adminSpace.getSpaceId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));

            existing.updateBasicInfo(
                    adminSpace.getName(),
                    adminSpace.getStatus(),
                    adminSpace.getFloor(),
                    adminSpace.getArea(),
                    toAmenitiesJson(adminSpace.getAmenities()),
                    adminSpace.getDescription()
            );
            SpaceEntity savedSpace = spaceJpaRepository.save(existing);

            // 상세 정보 수정
            updateDetail(savedSpace, adminSpace);

            return toAdminSpace(savedSpace);
        }

        // === 신규 생성(Create) ===
        SpaceEntity entity = SpaceEntity.builder()
                .name(adminSpace.getName())
                .type(adminSpace.getType())
                .status(adminSpace.getStatus())
                .floor(adminSpace.getFloor())
                .area(adminSpace.getArea())
                .amenities(toAmenitiesJson(adminSpace.getAmenities()))
                .description(adminSpace.getDescription())
                .positionX(adminSpace.getPositionX())
                .positionY(adminSpace.getPositionY())
                .build();

        SpaceEntity savedSpace = spaceJpaRepository.save(entity);
        createDetail(savedSpace, adminSpace);

        return toAdminSpace(savedSpace);
    }

    @Override
    public Optional<AdminSpace> findById(Long spaceId) {
        return spaceJpaRepository.findById(spaceId).map(this::toAdminSpace);
    }

    @Override
    public Page<AdminSpace> findAll(Pageable pageable) {
        return spaceJpaRepository.findAll(pageable).map(this::toAdminSpace);
    }

    @Override
    public boolean existsByName(String name) {
        return spaceJpaRepository.existsByName(name);
    }

    @Override
    public void softDelete(Long spaceId) {
        SpaceEntity entity = spaceJpaRepository.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));
        spaceJpaRepository.delete(entity);
    }

    @Override
    public List<AdminSpace> findByFloor(Integer floor) {
        return spaceJpaRepository.findByFloor(floor).stream()
                .map(this::toAdminSpace).toList();
    }

    @Override
    public void updatePositions(List<AdminSpace> spaces) {
        throw new UnsupportedOperationException("Space 배치 수정 기능은 feat/59 이후 범위입니다.");
    }

    // === Detail 생성/수정 ===

    private void createDetail(SpaceEntity savedSpace, AdminSpace adminSpace) {
        if (adminSpace.getType() == com.coliving.admin.space.model.SpaceType.PRIVATE && adminSpace.getPrivateDetail() != null) {
            RoomTypeEntity roomTypeEntity = roomTypeJpaRepository.findById(adminSpace.getPrivateDetail().getRoomTypeId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_TYPE_NOT_FOUND));

            privateSpaceDetailJpaRepository.save(PrivateSpaceDetailEntity.builder()
                    .space(savedSpace)
                    .roomType(roomTypeEntity)
                    .roomCount(adminSpace.getPrivateDetail().getRoomCount())
                    .bathroomCount(adminSpace.getPrivateDetail().getBathroomCount())
                    .direction(adminSpace.getPrivateDetail().getDirection())
                    .deposit(adminSpace.getPrivateDetail().getDeposit())
                    .monthlyRent(adminSpace.getPrivateDetail().getMonthlyRent())
                    .maintenanceFee(adminSpace.getPrivateDetail().getMaintenanceFee())
                    .parkingAvailable(adminSpace.getPrivateDetail().getParkingAvailable())
                    .build());
        } else if (adminSpace.getType() == com.coliving.admin.space.model.SpaceType.COMMON && adminSpace.getCommonDetail() != null) {
            commonSpaceDetailJpaRepository.save(CommonSpaceDetailEntity.builder()
                    .space(savedSpace)
                    .maxCapacity(adminSpace.getCommonDetail().getMaxCapacity())
                    .operatingHours(adminSpace.getCommonDetail().getOperatingHours())
                    .isReservable(adminSpace.getCommonDetail().getIsReservable())
                    .usageFee(adminSpace.getCommonDetail().getUsageFee())
                    .build());
        }
    }

    private void updateDetail(SpaceEntity savedSpace, AdminSpace adminSpace) {
        if (adminSpace.getType() == com.coliving.admin.space.model.SpaceType.PRIVATE && adminSpace.getPrivateDetail() != null) {
            if (savedSpace.getPrivateDetail() != null) {
                RoomTypeEntity roomTypeEntity = roomTypeJpaRepository.findById(adminSpace.getPrivateDetail().getRoomTypeId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_TYPE_NOT_FOUND));

                savedSpace.getPrivateDetail().update(
                        roomTypeEntity,
                        adminSpace.getPrivateDetail().getRoomCount(),
                        adminSpace.getPrivateDetail().getBathroomCount(),
                        adminSpace.getPrivateDetail().getDirection(),
                        adminSpace.getPrivateDetail().getDeposit(),
                        adminSpace.getPrivateDetail().getMonthlyRent(),
                        adminSpace.getPrivateDetail().getMaintenanceFee(),
                        adminSpace.getPrivateDetail().getParkingAvailable()
                );
                privateSpaceDetailJpaRepository.save(savedSpace.getPrivateDetail());
            } else {
                createDetail(savedSpace, adminSpace);
            }
        } else if (adminSpace.getType() == com.coliving.admin.space.model.SpaceType.COMMON && adminSpace.getCommonDetail() != null) {
            if (savedSpace.getCommonDetail() != null) {
                savedSpace.getCommonDetail().update(
                        adminSpace.getCommonDetail().getMaxCapacity(),
                        adminSpace.getCommonDetail().getOperatingHours(),
                        adminSpace.getCommonDetail().getIsReservable(),
                        adminSpace.getCommonDetail().getUsageFee()
                );
                commonSpaceDetailJpaRepository.save(savedSpace.getCommonDetail());
            } else {
                createDetail(savedSpace, adminSpace);
            }
        }
    }



    // === Entity → AdminSpace 변환 ===

    private AdminSpace toAdminSpace(SpaceEntity entity) {
        AdminSpace.AdminSpaceBuilder builder = AdminSpace.builder()
                .spaceId(entity.getSpaceId())
                .name(entity.getName())
                .type(entity.getType())
                .status(entity.getStatus())
                .floor(entity.getFloor())
                .area(entity.getArea())
                .amenities(parseAmenities(entity.getAmenities()))
                .description(entity.getDescription())
                .positionX(entity.getPositionX())
                .positionY(entity.getPositionY());

        if (entity.getPrivateDetail() != null) {
            builder.privateDetail(AdminSpace.PrivateSpaceDetail.builder()
                    .roomTypeId(entity.getPrivateDetail().getRoomType().getId())
                    .roomTypeName(entity.getPrivateDetail().getRoomType().getName())
                    .roomCount(entity.getPrivateDetail().getRoomCount())
                    .bathroomCount(entity.getPrivateDetail().getBathroomCount())
                    .direction(entity.getPrivateDetail().getDirection())
                    .deposit(entity.getPrivateDetail().getDeposit())
                    .monthlyRent(entity.getPrivateDetail().getMonthlyRent())
                    .maintenanceFee(entity.getPrivateDetail().getMaintenanceFee())
                    .parkingAvailable(entity.getPrivateDetail().getParkingAvailable())
                    .build());
        }

        if (entity.getCommonDetail() != null) {
            builder.commonDetail(AdminSpace.CommonSpaceDetail.builder()
                    .maxCapacity(entity.getCommonDetail().getMaxCapacity())
                    .operatingHours(entity.getCommonDetail().getOperatingHours())
                    .isReservable(entity.getCommonDetail().getIsReservable())
                    .usageFee(entity.getCommonDetail().getUsageFee())
                    .build());
        }

        if (entity.getImages() != null) {
            builder.images(entity.getImages().stream()
                    .map(img -> AdminSpace.SpaceImage.builder()
                            .spaceImageId(img.getSpaceImageId())
                            .imageUrl(img.getImageUrl())
                            .imageType(img.getImageType())
                            .sortOrder(img.getSortOrder())
                            .isThumbnail(img.getIsThumbnail())
                            .build())
                    .toList());
        }

        return builder.build();
    }

    // === JSON 변환 헬퍼 ===

    private String toAmenitiesJson(List<String> amenities) {
        if (amenities == null || amenities.isEmpty()) return "[]";
        return "[" + amenities.stream()
                .map(s -> "\"" + s + "\"")
                .collect(Collectors.joining(",")) + "]";
    }

    private List<String> parseAmenities(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        String trimmed = json.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]"))
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        if (trimmed.isEmpty()) return Collections.emptyList();
        return Arrays.stream(trimmed.split(","))
                .map(s -> s.trim().replaceAll("^\"|\"$", ""))
                .filter(s -> !s.isEmpty()).toList();
    }

    @Override
    public void saveImage(Long spaceId, AdminSpace.SpaceImage image) {
        SpaceEntity entity = spaceJpaRepository.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));

        SpaceImageEntity imageEntity = SpaceImageEntity.builder()
                .space(entity)
                .imageUrl(image.getImageUrl())
                .imageType(com.coliving.admin.space.model.ImageType.valueOf(image.getImageType().name()))
                .sortOrder(image.getSortOrder() != null ? image.getSortOrder() : 0)
                .isThumbnail(image.getIsThumbnail() != null ? image.getIsThumbnail() : false)
                .build();

        spaceImageJpaRepository.save(imageEntity);
    }

    @Override
    public void deleteImage(Long imageId) {
        spaceImageJpaRepository.deleteById(imageId);
    }
}
