package com.coliving.admin.device.adapter.in.web;

import com.coliving.admin.device.adapter.in.web.dto.req.CreateAdminDeviceRequestDto;
import com.coliving.admin.device.adapter.in.web.dto.res.CreateAdminDeviceResponseDto;
import com.coliving.admin.device.application.port.in.CreateAdminDeviceUseCase;
import com.coliving.admin.device.application.result.CreateAdminDeviceResult;
import com.coliving.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/devices")
@RequiredArgsConstructor
public class AdminDeviceController {

    private final CreateAdminDeviceUseCase createAdminDeviceUseCase;

    /**
     * 기기 등록 (ADM-DEV-02)
     * POST /api/admin/devices
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CreateAdminDeviceResponseDto>> createDevice(
            @Valid @RequestBody CreateAdminDeviceRequestDto requestDto) {

        CreateAdminDeviceResult result = createAdminDeviceUseCase.execute(requestDto.toCommand());
        CreateAdminDeviceResponseDto responseDto = CreateAdminDeviceResponseDto.from(result);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDto, "기기가 등록되었습니다"));
    }
}
