package com.coliving.resident.device_control.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

/**
 * 기기 제어 요청 DTO
 */
public record ControlDeviceRequestDto(
        @NotBlank(message = "명령어는 필수입니다")
        String command,
        Map<String, Object> params
) {
}
