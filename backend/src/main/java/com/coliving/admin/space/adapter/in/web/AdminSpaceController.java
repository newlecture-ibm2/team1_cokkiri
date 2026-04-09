package com.coliving.admin.space.adapter.in.web;

import com.coliving.admin.space.adapter.in.web.dto.req.CreateSpaceRequestDto;
import com.coliving.admin.space.adapter.in.web.dto.req.UpdateSpaceRequestDto;
import com.coliving.admin.space.adapter.in.web.dto.req.UpdateSpaceLayoutRequestDto;
import com.coliving.admin.space.adapter.in.web.dto.res.AdminSpaceResponseDto;
import com.coliving.admin.space.application.command.CreateSpaceCommand;
import com.coliving.admin.space.application.command.UpdateSpaceCommand;
import com.coliving.admin.space.application.command.UpdateSpaceLayoutCommand;
import com.coliving.admin.space.application.port.in.AdminSpaceUseCase;
import com.coliving.admin.space.application.result.AdminSpaceResult;
import com.coliving.global.dto.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.List;

@Tag(name = "Admin Space", description = "관리자 공간 관리 API")
@RestController
@RequestMapping("/api/admin/spaces")
@RequiredArgsConstructor
public class AdminSpaceController {

    private final AdminSpaceUseCase adminSpaceUseCase;

    @Operation(summary = "공간 배치 저장 (Bulk 좌표 업데이트)")
    @PutMapping("/layout")
    public ApiResponse<Void> updateLayout(
            @Valid @RequestBody UpdateSpaceLayoutRequestDto request) {
        UpdateSpaceLayoutCommand command = UpdateSpaceLayoutCommand.builder()
                .positions(request.getPositions().stream()
                        .map(p -> UpdateSpaceLayoutCommand.SpacePositionItem.builder()
                                .spaceId(p.getSpaceId())
                                .positionX(p.getPositionX())
                                .positionY(p.getPositionY())
                                .positionW(p.getPositionW())
                                .positionH(p.getPositionH())
                                .build())
                        .toList())
                .build();

        adminSpaceUseCase.updateLayout(command);
        return ApiResponse.ok(null, "배치가 저장되었습니다.");
    }

    @Operation(summary = "공간 생성")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminSpaceResponseDto> createSpace(
            @Valid @RequestBody CreateSpaceRequestDto request) {

        CreateSpaceCommand command = CreateSpaceCommand.builder()
                .name(request.getName())
                .type(request.getType())
                .status(request.getStatus())
                .floor(request.getFloor())
                .area(request.getArea())
                .amenities(request.getAmenities())
                .description(request.getDescription())
                .roomTypeId(request.getRoomTypeId())
                .roomCount(request.getRoomCount())
                .bathroomCount(request.getBathroomCount())
                .direction(request.getDirection())
                .deposit(request.getDeposit())
                .monthlyRent(request.getMonthlyRent())
                .maintenanceFee(request.getMaintenanceFee())
                .parkingAvailable(request.getParkingAvailable())
                .maxCapacity(request.getMaxCapacity())
                .operatingHours(request.getOperatingHours())
                .isReservable(request.getIsReservable())
                .usageFee(request.getUsageFee())
                .build();

        AdminSpaceResult result = adminSpaceUseCase.createSpace(command);
        return ApiResponse.ok(AdminSpaceResponseDto.from(result));
    }

    @Operation(summary = "공간 단건 조회")
    @GetMapping("/{spaceId}")
    public ApiResponse<AdminSpaceResponseDto> getSpace(@PathVariable Long spaceId) {
        AdminSpaceResult result = adminSpaceUseCase.getSpace(spaceId);
        return ApiResponse.ok(AdminSpaceResponseDto.from(result));
    }

    @Operation(summary = "공간 목록 조회 (페이징)")
    @GetMapping
    public ApiResponse<Page<AdminSpaceResponseDto>> getSpaces(
            @RequestParam(required = false) com.coliving.admin.space.model.SpaceType type,
            @RequestParam(required = false) com.coliving.admin.space.model.SpaceStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AdminSpaceResponseDto> result = adminSpaceUseCase.getSpaces(type, status, pageable)
                .map(AdminSpaceResponseDto::from);
        return ApiResponse.ok(result);
    }

    @Operation(summary = "공간 수정")
    @PutMapping("/{spaceId}")
    public ApiResponse<AdminSpaceResponseDto> updateSpace(
            @PathVariable Long spaceId,
            @Valid @RequestBody UpdateSpaceRequestDto request) {

        UpdateSpaceCommand command = UpdateSpaceCommand.builder()
                .spaceId(spaceId)
                .name(request.getName())
                .status(request.getStatus())
                .floor(request.getFloor())
                .area(request.getArea())
                .amenities(request.getAmenities())
                .description(request.getDescription())
                .roomTypeId(request.getRoomTypeId())
                .roomCount(request.getRoomCount())
                .bathroomCount(request.getBathroomCount())
                .direction(request.getDirection())
                .deposit(request.getDeposit())
                .monthlyRent(request.getMonthlyRent())
                .maintenanceFee(request.getMaintenanceFee())
                .parkingAvailable(request.getParkingAvailable())
                .maxCapacity(request.getMaxCapacity())
                .operatingHours(request.getOperatingHours())
                .isReservable(request.getIsReservable())
                .usageFee(request.getUsageFee())
                .build();

        AdminSpaceResult result = adminSpaceUseCase.updateSpace(command);
        return ApiResponse.ok(AdminSpaceResponseDto.from(result));
    }

    @Operation(summary = "공간 삭제 (논리 삭제)")
    @DeleteMapping("/{spaceId}")
    public ApiResponse<Void> deleteSpace(@PathVariable Long spaceId) {
        adminSpaceUseCase.deleteSpace(spaceId);
        return ApiResponse.ok(null);
    }

    @Operation(summary = "공간 이미지 단건 업로드")
    @PostMapping("/{spaceId}/images")
    public ApiResponse<Void> uploadSpaceImage(
            @PathVariable Long spaceId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "imageType", required = false, defaultValue = "PHOTO") com.coliving.admin.space.model.ImageType imageType,
            @RequestParam(value = "isThumbnail", required = false, defaultValue = "false") Boolean isThumbnail) {
        adminSpaceUseCase.uploadImage(spaceId, file, imageType, isThumbnail);
        return ApiResponse.ok(null);
    }

    @Operation(summary = "공간 이미지 단건 다운로드/서빙")
    @GetMapping("/{spaceId}/images/serve/{fileName}")
    public ResponseEntity<Resource> serveSpaceImage(
            @PathVariable Long spaceId,
            @PathVariable String fileName) {
        try {
            Path filePath = adminSpaceUseCase.loadImage(spaceId, fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "공간 이미지 삭제")
    @DeleteMapping("/{spaceId}/images/{imageId}")
    public ApiResponse<Void> deleteSpaceImage(
            @PathVariable Long spaceId,
            @PathVariable Long imageId) {
        adminSpaceUseCase.deleteImage(spaceId, imageId);
        return ApiResponse.ok(null);
    }
}
