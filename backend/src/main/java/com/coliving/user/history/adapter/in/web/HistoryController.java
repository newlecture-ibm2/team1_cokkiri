package com.coliving.user.history.adapter.in.web;

import com.coliving.global.dto.ApiResponse;
import com.coliving.user.history.application.port.in.ViewHistoryUseCase;
import com.coliving.user.history.application.result.HistoryListResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User History", description = "사용자 활동 이력 조회 API")
@RestController
@RequestMapping("/api/users/me/history")
@RequiredArgsConstructor
public class HistoryController {

    private final ViewHistoryUseCase viewHistoryUseCase;

    /**
     * USR-HST-01: 활동 이력 조회
     * type = CONTRACT | APPLICATION | POST | COMMENT (null이면 전체)
     */
    @Operation(summary = "활동 이력 조회", description = "사용자의 활동 이력을 유형별로 조회합니다.")
    @GetMapping
    public ApiResponse<HistoryListResult> getMyHistory(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "p", defaultValue = "0") int page,
            @RequestParam(value = "s", defaultValue = "20") int size) {

        Long userId = getCurrentUserId();
        return ApiResponse.ok(viewHistoryUseCase.viewHistory(userId, type, page, size));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            try {
                return Long.parseLong(auth.getName());
            } catch (NumberFormatException e) {
                return 1L;
            }
        }
        return 1L;
    }
}
