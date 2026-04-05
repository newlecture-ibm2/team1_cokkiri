package com.coliving.global.html;

/**
 * 민원 본문·관리자 답변 등 VoC 관련 HTML을 저장·조회 시 정제합니다.
 * 이미지 src는 {@code /api/files/voc/…} 만 허용합니다.
 */
public final class VocBodyHtmlSanitizer {

    private VocBodyHtmlSanitizer() {
    }

    public static String sanitize(String raw) {
        return RichBodyHtmlSanitizer.sanitizeVoc(raw);
    }
}
