package com.coliving.admin.monitoring.application.result;

import com.coliving.admin.monitoring.adapter.in.web.dto.res.AdminControlLogResponseDto;

import java.util.List;

/**
 * 관리자 제어 이력 페이징 결과 (불변 객체)
 */
public record AdminControlLogPageResult(
        List<AdminControlLogResponseDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
