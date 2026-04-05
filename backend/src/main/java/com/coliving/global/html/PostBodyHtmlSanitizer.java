package com.coliving.global.html;

/**
 * 커뮤니티 게시글 본문(Quill 등에서 온 HTML)을 저장·조회 시 한 번 더 정제합니다.
 * 이미지 src는 업로드 스토리지 경로({@code /api/files/community/…})만 허용합니다.
 */
public final class PostBodyHtmlSanitizer {

    private PostBodyHtmlSanitizer() {
    }

    public static String sanitize(String raw) {
        return RichBodyHtmlSanitizer.sanitizeCommunity(raw);
    }
}
