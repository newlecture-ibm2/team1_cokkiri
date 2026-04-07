package com.coliving.common.community.adapter.out.cache;

import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommunityViewCountSyncScheduler {
    private final CommunityViewCountCache viewCountCache;
    private final PostJpaRepository postJpaRepository;

    @Scheduled(fixedDelayString = "${app.community.view-sync-ms:10000}")
    @Transactional
    public void flushViewCountDeltas() {
        Map<Long, Long> deltas = viewCountCache.drainAll();
        if (deltas.isEmpty()) return;

        long touched = 0L;
        for (Map.Entry<Long, Long> e : deltas.entrySet()) {
            long delta = e.getValue() == null ? 0L : e.getValue();
            if (delta <= 0L) continue;
            int updated = postJpaRepository.addViewCount(e.getKey(), delta);
            if (updated > 0) touched++;
        }
        log.debug("community viewCount sync completed. touchedPosts={}", touched);
    }
}

