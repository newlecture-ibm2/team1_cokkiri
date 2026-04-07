package com.coliving.admin.device.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

/**
 * 관리자 기기 제어 요청 DTO (ADM-DEV-04)
 * POST /api/admin/devices/{id}/control
 */
public record ControlAdminDeviceRequestDto(
        @NotBlank(message = "제어 명령은 필수입니다")
        String command,

        Map<String, Object> params
) {
}
