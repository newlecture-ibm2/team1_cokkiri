package com.coliving.admin.device.adapter.in.web;

import com.coliving.admin.device.adapter.in.web.dto.req.SaveDeviceTypeRequestDto;
import com.coliving.admin.device.adapter.in.web.dto.res.DeviceTypeResponseDto;
import com.coliving.admin.device.application.port.in.DeviceTypeUseCase;
import com.coliving.admin.device.model.AdminDeviceType;
import com.coliving.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/device-types")
@RequiredArgsConstructor
public class AdminDeviceTypeController {

    private final DeviceTypeUseCase deviceTypeUseCase;

    /**
     * 기기 종류 목록 조회
     * GET /api/admin/device-types
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceTypeResponseDto>>> getDeviceTypeList() {
        List<AdminDeviceType> types = deviceTypeUseCase.getDeviceTypeList();
        List<DeviceTypeResponseDto> dtoList = types.stream()
                .map(DeviceTypeResponseDto::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(dtoList));
    }

    /**
     * 기기 종류 등록
     * POST /api/admin/device-types
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DeviceTypeResponseDto>> createDeviceType(
            @Valid @RequestBody SaveDeviceTypeRequestDto requestDto) {

        AdminDeviceType created = deviceTypeUseCase.createDeviceType(requestDto.toCommand(null));
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(DeviceTypeResponseDto.from(created), "기기 종류가 등록되었습니다"));
    }

    /**
     * 기기 종류 수정
     * PUT /api/admin/device-types/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DeviceTypeResponseDto>> updateDeviceType(
            @PathVariable Long id,
            @Valid @RequestBody SaveDeviceTypeRequestDto requestDto) {

        AdminDeviceType updated = deviceTypeUseCase.updateDeviceType(requestDto.toCommand(id));
        return ResponseEntity.ok(ApiResponse.ok(DeviceTypeResponseDto.from(updated), "기기 종류가 수정되었습니다"));
    }

    /**
     * 기기 종류 삭제 (Soft Delete)
     * DELETE /api/admin/device-types/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDeviceType(@PathVariable Long id) {
        deviceTypeUseCase.deleteDeviceType(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "기기 종류가 삭제되었습니다"));
    }
}
