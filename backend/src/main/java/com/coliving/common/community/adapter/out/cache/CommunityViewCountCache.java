package com.coliving.common.community.adapter.out.cache;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CommunityViewCountCache {
    private static final String HASH_KEY = "community:view:delta";
    private static final String DRAIN_KEY = "community:view:delta:drain";

    private final StringRedisTemplate redis;
    private final Map<Long, Long> localDelta = new ConcurrentHashMap<>();

    public CommunityViewCountCache(ObjectProvider<StringRedisTemplate> redisProvider) {
        this.redis = redisProvider.getIfAvailable();
    }

    public long incrementAndGetDelta(Long postId) {
        if (postId == null) {
            return 0L;
        }

        if (redis != null) {
            try {
                Long value = redis.opsForHash().increment(HASH_KEY, String.valueOf(postId), 1L);
                return value == null ? 1L : value;
            } catch (RuntimeException ignored) {
                // Redis 장애 시 로컬 메모리 폴백
            }
        }

        return localDelta.merge(postId, 1L, Long::sum);
    }

    public long getDelta(Long postId) {
        if (postId == null) {
            return 0L;
        }

        if (redis != null) {
            try {
                Object value = redis.opsForHash().get(HASH_KEY, String.valueOf(postId));
                if (value == null) return 0L;
                return Long.parseLong(String.valueOf(value));
            } catch (RuntimeException ignored) {
                // Redis 장애 시 로컬 메모리 폴백
            }
        }
        return localDelta.getOrDefault(postId, 0L);
    }

    public Map<Long, Long> drainAll() {
        if (redis != null) {
            try {
                Map<Long, Long> merged = new LinkedHashMap<>();

                // 이전 flush 도중 실패한 잔여 데이터 복구
                Map<Object, Object> pendingRaw = redis.opsForHash().entries(DRAIN_KEY);
                merge(merged, toLongMap(pendingRaw));
                if (!pendingRaw.isEmpty()) {
                    redis.delete(DRAIN_KEY);
                }

                // 현재 누적분 snapshot
                Boolean exists = redis.hasKey(HASH_KEY);
                if (Boolean.TRUE.equals(exists)) {
                    redis.rename(HASH_KEY, DRAIN_KEY);
                    Map<Object, Object> raw = redis.opsForHash().entries(DRAIN_KEY);
                    merge(merged, toLongMap(raw));
                    redis.delete(DRAIN_KEY);
                }
                return merged;
            } catch (RuntimeException ignored) {
                // Redis 장애 시 로컬 메모리 폴백
            }
        }

        synchronized (localDelta) {
            if (localDelta.isEmpty()) return Map.of();
            Map<Long, Long> snap = new LinkedHashMap<>(localDelta);
            localDelta.clear();
            return snap;
        }
    }

    private Map<Long, Long> toLongMap(Map<Object, Object> raw) {
        if (raw == null || raw.isEmpty()) return Map.of();
        Map<Long, Long> out = new LinkedHashMap<>();
        for (Map.Entry<Object, Object> e : raw.entrySet()) {
            try {
                Long postId = Long.parseLong(String.valueOf(e.getKey()));
                Long delta = Long.parseLong(String.valueOf(e.getValue()));
                if (delta > 0L) out.put(postId, delta);
            } catch (NumberFormatException ignored) {
            }
        }
        return out;
    }

    private void merge(Map<Long, Long> target, Map<Long, Long> from) {
        if (from == null || from.isEmpty()) return;
        for (Map.Entry<Long, Long> e : from.entrySet()) {
            target.merge(e.getKey(), e.getValue(), Long::sum);
        }
    }
}

