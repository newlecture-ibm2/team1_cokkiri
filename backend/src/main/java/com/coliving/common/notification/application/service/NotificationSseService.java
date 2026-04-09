package com.coliving.common.notification.application.service;

import com.coliving.common.notification.adapter.in.web.dto.res.NotificationSseEventResponseDto;
import com.coliving.common.notification.model.Notification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationSseService {
    private static final long SSE_TIMEOUT_MS = 30L * 60L * 1000L;
    private static final String EVENT_CONNECTED = "connected";
    private static final String EVENT_NOTIFICATION = "notification";
    private static final String EVENT_HEARTBEAT = "heartbeat";

    private final Map<Long, Map<String, SseEmitter>> emittersByUser = new ConcurrentHashMap<>();

    public SseEmitter connect(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        String emitterId = buildEmitterId(userId);

        emittersByUser
                .computeIfAbsent(userId, ignored -> new ConcurrentHashMap<>())
                .put(emitterId, emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitterId));
        emitter.onTimeout(() -> removeEmitter(userId, emitterId));
        emitter.onError(ignored -> removeEmitter(userId, emitterId));

        try {
            emitter.send(SseEmitter.event()
                    .name(EVENT_CONNECTED)
                    .data(Map.of("status", "connected")));
        } catch (Exception e) {
            emitter.complete();
            removeEmitter(userId, emitterId);
        }

        return emitter;
    }

    public void sendNotification(Notification notification) {
        if (notification == null || notification.getUserId() == null) {
            return;
        }

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
        sendNotification(payload);
    }

    public void sendNotification(NotificationSseEventResponseDto payload) {
        if (payload == null || payload.getNotificationId() == null || payload.getUserId() == null) {
            return;
        }
        sendNotificationToUser(payload.getUserId(), payload);
    }

    public void sendNotificationToUser(Long userId, NotificationSseEventResponseDto payload) {
        if (userId == null || payload == null) {
            return;
        }
        Map<String, SseEmitter> userEmitters = emittersByUser.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }

        userEmitters.forEach((emitterId, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name(EVENT_NOTIFICATION)
                        .id(String.valueOf(payload.getNotificationId()))
                        .data(payload));
            } catch (Exception e) {
                emitter.complete();
                removeEmitter(userId, emitterId);
            }
        });
    }

    @Scheduled(fixedDelay = 30000)
    public void sendHeartbeat() {
        emittersByUser.forEach((userId, userEmitters) -> {
            userEmitters.forEach((emitterId, emitter) -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name(EVENT_HEARTBEAT)
                            .data("ping"));
                } catch (Exception e) {
                    emitter.complete();
                    removeEmitter(userId, emitterId);
                }
            });
        });
    }

    private void removeEmitter(Long userId, String emitterId) {
        Map<String, SseEmitter> userEmitters = emittersByUser.get(userId);
        if (userEmitters == null) {
            return;
        }
        userEmitters.remove(emitterId);
        if (userEmitters.isEmpty()) {
            emittersByUser.remove(userId);
        }
    }

    private String buildEmitterId(Long userId) {
        return userId + "_" + UUID.randomUUID();
    }
}
