package com.coliving.global.attachment;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.function.UnaryOperator;

/**
 * 수정 요청의 "유지 첨부" 목록을 DB에 있던 항목과 대조합니다. URL이 기존에 없으면 거절하고,
 * 메타데이터는 서버 보관 객체를 반환합니다.
 */
public final class RetainedAttachmentResolver {

    private RetainedAttachmentResolver() {
    }

    public static <T> List<T> resolve(
            List<T> existingOnRecord,
            List<T> clientRetained,
            Function<T, String> getFileUrl,
            UnaryOperator<String> normalizeUrl) {
        List<T> existing = existingOnRecord == null ? List.of() : existingOnRecord;
        Map<String, T> byNormalizedUrl = new LinkedHashMap<>();
        for (T a : existing) {
            if (a == null) {
                continue;
            }
            String url = getFileUrl.apply(a);
            if (url == null || url.isBlank()) {
                continue;
            }
            String key = normalizeUrl.apply(url);
            byNormalizedUrl.putIfAbsent(key, a);
        }

        List<T> out = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (T c : clientRetained) {
            if (c == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }
            String rawUrl = getFileUrl.apply(c);
            if (rawUrl == null || rawUrl.isBlank()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }
            String key = normalizeUrl.apply(rawUrl);
            if (!seen.add(key)) {
                continue;
            }
            T canonical = byNormalizedUrl.get(key);
            if (canonical == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }
            out.add(canonical);
        }
        return out;
    }
}
