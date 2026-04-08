package com.coliving.common.community.adapter.out.cache;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Component
public class CommunityLikeActionGuard {
    private static final DefaultRedisScript<Long> COMPARE_AND_DELETE_SCRIPT = new DefaultRedisScript<>(
            "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
            Long.class
    );

    private final StringRedisTemplate redis;
    private final Map<String, ReentrantLock> localLocks = new ConcurrentHashMap<>();

    public CommunityLikeActionGuard(ObjectProvider<StringRedisTemplate> redisProvider) {
        this.redis = redisProvider.getIfAvailable();
    }

    public LockHandle acquire(Long postId, Long userId) {
        String key = "community:like:lock:" + postId + ":" + userId;

        if (redis != null) {
            try {
                String token = UUID.randomUUID().toString();
                Boolean ok = redis.opsForValue().setIfAbsent(key, token, Duration.ofSeconds(3));
                if (!Boolean.TRUE.equals(ok)) {
                    throw new BusinessException(ErrorCode.CONCURRENCY_ERROR);
                }
                return () -> {
                    try {
                        redis.execute(
                                COMPARE_AND_DELETE_SCRIPT,
                                Collections.singletonList(key),
                                token
                        );
                    } catch (RuntimeException ignored) {
                    }
                };
            } catch (BusinessException e) {
                throw e;
            } catch (RuntimeException ignored) {
                // Redis 장애 시 로컬 락 폴백
            }
        }

        ReentrantLock lock = localLocks.computeIfAbsent(key, k -> new ReentrantLock());
        boolean ok = lock.tryLock();
        if (!ok) {
            throw new BusinessException(ErrorCode.CONCURRENCY_ERROR);
        }
        return () -> {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        };
    }

    @FunctionalInterface
    public interface LockHandle extends AutoCloseable {
        @Override
        void close();
    }
}

