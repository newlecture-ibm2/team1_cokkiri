package com.coliving.common.notification.adapter.in.web;

import com.coliving.common.notification.adapter.in.web.dto.res.NotificationItemResponseDto;
import com.coliving.common.notification.adapter.in.web.dto.res.NotificationListResponseDto;
import com.coliving.common.notification.adapter.in.web.dto.res.NotificationReadResponseDto;
import com.coliving.common.notification.application.command.ListNotificationsCommand;
import com.coliving.common.notification.application.command.MarkNotificationReadCommand;
import com.coliving.common.notification.application.port.in.NotificationUseCase;
import com.coliving.common.notification.application.result.MarkNotificationReadResult;
import com.coliving.common.notification.application.result.NotificationItemResult;
import com.coliving.common.notification.application.result.NotificationListResult;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController {

    private final NotificationUseCase notificationUseCase;

    public NotificationController(NotificationUseCase notificationUseCase) {
        this.notificationUseCase = notificationUseCase;
    }

    @GetMapping("/api/notifications")
    public ApiResponse<NotificationListResponseDto> listNotifications(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort
    ) {
        Long userId = getAuthenticatedUserId();

        ListNotificationsCommand command = ListNotificationsCommand.builder()
                .userId(userId)
                .isRead(isRead)
                .page(page)
                .size(size)
                .sort(sort)
                .build();

        NotificationListResult result = notificationUseCase.listNotifications(command);

        NotificationListResponseDto response = NotificationListResponseDto.builder()
                .content(result.getContent().stream()
                        .map(this::toItemDto)
                        .toList())
                .page(result.getPage())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return ApiResponse.ok(response);
    }

    @PatchMapping("/api/notifications/{notificationId}/read")
    public ApiResponse<NotificationReadResponseDto> markAsRead(@PathVariable Long notificationId) {
        Long userId = getAuthenticatedUserId();

        MarkNotificationReadCommand command = MarkNotificationReadCommand.builder()
                .userId(userId)
                .notificationId(notificationId)
                .build();

        MarkNotificationReadResult result = notificationUseCase.markAsRead(command);

        NotificationReadResponseDto response = NotificationReadResponseDto.builder()
                .notificationId(result.getNotificationId())
                .isRead(result.isRead())
                .build();

        return ApiResponse.ok(response);
    }

    private NotificationItemResponseDto toItemDto(NotificationItemResult item) {
        return NotificationItemResponseDto.builder()
                .notificationId(item.getNotificationId())
                .type(item.getType().name())
                .title(item.getTitle())
                .message(item.getMessage())
                .referenceType(item.getReferenceType() != null ? item.getReferenceType().name() : null)
                .referenceId(item.getReferenceId())
                .isRead(item.isRead())
                .createdAt(item.getCreatedAt())
                .build();
    }

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }
}
