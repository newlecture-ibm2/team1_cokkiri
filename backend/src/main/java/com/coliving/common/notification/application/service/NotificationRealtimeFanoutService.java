package com.coliving.common.notification.application.service;

import com.coliving.common.notification.adapter.in.web.dto.res.NotificationSseEventResponseDto;
import com.coliving.common.notification.model.Notification;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationRealtimeFanoutService {
    public static final String CHANNEL = "notification:sse:events";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;
    private final NotificationSseService notificationSseService;

    public NotificationRealtimeFanoutService(StringRedisTemplate stringRedisTemplate,
                                             ObjectMapper objectMapper,
                                             NotificationSseService notificationSseService) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
        this.notificationSseService = notificationSseService;
    }

    public void publish(Notification notification) {
        NotificationSseEventResponseDto payload = NotificationSseEventResponseDto.builder()
                .userId(notification.getUserId())
                .notificationId(notification.getNotificationId())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceType(notification.getReferenceType() != null ? notification.getReferenceType().name() : null)
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();

        try {
            String raw = objectMapper.writeValueAsString(payload);
            stringRedisTemplate.convertAndSend(CHANNEL, raw);
        } catch (Exception e) {
            // Redis/직렬화 장애 시에도 현재 인스턴스 연결로는 즉시 전달
            notificationSseService.sendNotification(payload);
        }
    }

    public void onMessage(String rawMessage) {
        try {
            NotificationSseEventResponseDto payload =
                    objectMapper.readValue(rawMessage, NotificationSseEventResponseDto.class);
            notificationSseService.sendNotification(payload);
        } catch (JsonProcessingException ignored) {
            // Malformed message is ignored to protect stream stability.
        }
    }
}
