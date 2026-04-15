package com.coliving.admin.device.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Mock IoT 에러 모드 설정 요청 DTO
 *
 * @param mode 에러 모드 ("normal" | "error" | "timeout" | "fault")
 */
public record ErrorModeRequestDto(
        @NotBlank(message = "mode는 필수입니다")
        @Pattern(regexp = "^(normal|error|timeout|fault)$",
                message = "mode는 normal, error, timeout, fault 중 하나여야 합니다")
        String mode
) {
}
