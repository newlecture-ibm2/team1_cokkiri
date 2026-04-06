package com.coliving.global.html;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;

/**
 * 제목·알림 미리보기 등 HTML을 쓰지 않는 필드용: 태그를 제거하고 공백을 한 줄로 정리합니다.
 */
public final class PlainTextHtmlSanitizer {

    private static final PolicyFactory STRIP_ALL = new HtmlPolicyBuilder().toFactory();

    private PlainTextHtmlSanitizer() {
    }

    public static String sanitizeTitle(String raw) {
        if (raw == null) {
            return "";
        }
        return collapseWhitespace(STRIP_ALL.sanitize(raw));
    }

    /**
     * 이미 정제된 HTML(또는 일반 텍스트)에서 태그를 제거한 뒤 짧은 한 줄 미리보기에 쓸 문자열을 만듭니다.
     */
    public static String toSingleLinePreview(String raw, int maxLen) {
        String plain = stripToPlain(raw);
        if (plain.length() <= maxLen) {
            return plain;
        }
        return plain.substring(0, maxLen) + "…";
    }

    public static String stripToPlain(String raw) {
        if (raw == null) {
            return "";
        }
        return collapseWhitespace(STRIP_ALL.sanitize(raw));
    }

    private static String collapseWhitespace(String s) {
        return s.replaceAll("\\s+", " ").strip();
    }
}
