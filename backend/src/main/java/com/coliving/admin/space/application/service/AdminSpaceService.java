package com.coliving.admin.space.application.service;

import com.coliving.admin.space.application.command.CreateSpaceCommand;
import com.coliving.admin.space.application.command.UpdateSpaceCommand;
import com.coliving.admin.space.application.command.UpdateSpaceLayoutCommand;
import com.coliving.admin.space.application.port.in.AdminSpaceUseCase;
import com.coliving.admin.space.application.port.out.AdminSpaceRepositoryPort;
import com.coliving.admin.space.application.result.AdminSpaceResult;
import com.coliving.admin.space.model.AdminSpace;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSpaceService implements AdminSpaceUseCase {

    private final AdminSpaceRepositoryPort adminSpaceRepositoryPort;
    private final com.coliving.admin.space.application.port.out.FileStoragePort fileStoragePort;

    @Override
    public AdminSpaceResult createSpace(CreateSpaceCommand command) {
        if (adminSpaceRepositoryPort.existsByName(command.getName())) {
            throw new BusinessException(ErrorCode.DUPLICATE_SPACE_NAME);
        }

        AdminSpace.AdminSpaceBuilder builder = AdminSpace.builder()
                .name(command.getName())
                .type(command.getType())
                .status(command.getStatus())
                .floor(command.getFloor())
                .area(command.getArea())
                .amenities(command.getAmenities())
                .description(command.getDescription());

        if (command.getType() == SpaceType.PRIVATE) {
            if (command.getRoomTypeId() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }
            builder.privateDetail(AdminSpace.PrivateSpaceDetail.builder()
                    .roomTypeId(command.getRoomTypeId())
                    .roomCount(command.getRoomCount())
                    .bathroomCount(command.getBathroomCount())
                    .direction(command.getDirection())
                    .deposit(command.getDeposit())
                    .monthlyRent(command.getMonthlyRent())
                    .maintenanceFee(command.getMaintenanceFee())
                    .parkingAvailable(command.getParkingAvailable())
                    .build());
        } else if (command.getType() == SpaceType.COMMON) {
            builder.commonDetail(AdminSpace.CommonSpaceDetail.builder()
                    .maxCapacity(command.getMaxCapacity())
                    .operatingHours(command.getOperatingHours())
                    .isReservable(command.getIsReservable())
                    .usageFee(command.getUsageFee())
                    .build());
        }

        AdminSpace saved = adminSpaceRepositoryPort.save(builder.build());
        return AdminSpaceResult.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminSpaceResult getSpace(Long spaceId) {
        AdminSpace space = adminSpaceRepositoryPort.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));
        return AdminSpaceResult.from(space);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminSpaceResult> getSpaces(SpaceType type, SpaceStatus status, Pageable pageable) {
        return adminSpaceRepositoryPort.findSpaces(type, status, pageable)
                .map(AdminSpaceResult::from);
    }

    @Override
    public AdminSpaceResult updateSpace(UpdateSpaceCommand command) {
        AdminSpace existing = adminSpaceRepositoryPort.findById(command.getSpaceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));

        if (existing.getStatus() == SpaceStatus.OCCUPIED) {
            throw new BusinessException(ErrorCode.OCCUPIED_SPACE_MODIFICATION);
        }

        if (!existing.getName().equals(command.getName())
                && adminSpaceRepositoryPort.existsByName(command.getName())) {
            throw new BusinessException(ErrorCode.DUPLICATE_SPACE_NAME);
        }

        AdminSpace.AdminSpaceBuilder builder = AdminSpace.builder()
                .spaceId(command.getSpaceId())
                .name(command.getName())
                .type(existing.getType())
                .status(command.getStatus())
                .floor(command.getFloor())
                .area(command.getArea())
                .amenities(command.getAmenities())
                .description(command.getDescription())
                .positionX(existing.getPositionX())
                .positionY(existing.getPositionY());

        if (existing.getType() == SpaceType.PRIVATE) {
            if (command.getRoomTypeId() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }
            builder.privateDetail(AdminSpace.PrivateSpaceDetail.builder()
                    .roomTypeId(command.getRoomTypeId())
                    .roomCount(command.getRoomCount())
                    .bathroomCount(command.getBathroomCount())
                    .direction(command.getDirection())
                    .deposit(command.getDeposit())
                    .monthlyRent(command.getMonthlyRent())
                    .maintenanceFee(command.getMaintenanceFee())
                    .parkingAvailable(command.getParkingAvailable())
                    .build());
        } else if (existing.getType() == SpaceType.COMMON) {
            builder.commonDetail(AdminSpace.CommonSpaceDetail.builder()
                    .maxCapacity(command.getMaxCapacity())
                    .operatingHours(command.getOperatingHours())
                    .isReservable(command.getIsReservable())
                    .usageFee(command.getUsageFee())
                    .build());
        }

        AdminSpace updated = adminSpaceRepositoryPort.save(builder.build());
        return AdminSpaceResult.from(updated);
    }

    @Override
    public void deleteSpace(Long spaceId) {
        AdminSpace existing = adminSpaceRepositoryPort.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));

        if (existing.getStatus() == SpaceStatus.OCCUPIED) {
            throw new BusinessException(ErrorCode.OCCUPIED_SPACE_MODIFICATION);
        }

        adminSpaceRepositoryPort.softDelete(spaceId);
    }

    @Override
    public void updateLayout(UpdateSpaceLayoutCommand command) {
        List<AdminSpace> spacesToUpdate = command.getPositions().stream()
                .map(pos -> AdminSpace.builder()
                        .spaceId(pos.getSpaceId())
                        .positionX(pos.getPositionX())
                        .positionY(pos.getPositionY())
                        .positionW(pos.getPositionW())
                        .positionH(pos.getPositionH())
                        .build())
                .toList();

        adminSpaceRepositoryPort.updatePositions(spacesToUpdate);
    }

    @Override
    public void uploadImage(Long spaceId, org.springframework.web.multipart.MultipartFile file, com.coliving.admin.space.model.ImageType imageType, Boolean isThumbnail) {
        AdminSpace existing = adminSpaceRepositoryPort.findById(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));

        String savedFileName = fileStoragePort.storeFile(spaceId, file);

        // 프론트엔드가 자체 프록시(/api/bff/...)를 통해 컨트롤러 엔드포인트를 타도록 경로 합성
        String imageUrl = "/api/admin/spaces/" + spaceId + "/images/serve/" + savedFileName;

        AdminSpace.SpaceImage newImage = AdminSpace.SpaceImage.builder()
                .imageUrl(imageUrl)
                .imageType(imageType)
                .isThumbnail(isThumbnail)
                .sortOrder(0)
                .build();

        adminSpaceRepositoryPort.saveImage(spaceId, newImage);
    }

    @Override
    @Transactional(readOnly = true)
    public java.nio.file.Path loadImage(Long spaceId, String fileName) {
        // 이미지가 실제로 존재하는지 여부 검증 (DB) 등 추가 가능
        return fileStoragePort.loadFile(spaceId, fileName);
    }

    @Override
    public void deleteImage(Long spaceId, Long imageId) {
        // 공간 존재 검증 시 엔티티 전체를 로드하면 JPA 양방향 연관관계(Cascade) 때문에 
        // soft-delete 된 이미지가 트랜잭션 플러시 시점에 다시 살아남 (findById 대신 existsById 사용)
        if (!adminSpaceRepositoryPort.existsById(spaceId)) {
            throw new BusinessException(ErrorCode.SPACE_NOT_FOUND);
        }

        adminSpaceRepositoryPort.deleteImage(imageId);
    }
}
