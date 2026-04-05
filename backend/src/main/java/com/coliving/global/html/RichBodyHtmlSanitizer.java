package com.coliving.global.html;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

import java.util.regex.Pattern;

import static com.coliving.global.html.PostBodyHtmlPathNormalizer.API_COMMUNITY_FILES_PREFIX;
import static com.coliving.global.html.VocBodyHtmlPathNormalizer.API_VOC_FILES_PREFIX;

/**
 * 커뮤니티·VoC 본문 HTML에 공통으로 쓰는 OWASP 정책(블록·포맷·링크 + 제한된 img)입니다.
 * 허용 이미지 경로 접두만 다릅니다.
 */
public final class RichBodyHtmlSanitizer {

    private static final PolicyFactory COMMUNITY_POLICY = policyForFilesPrefix(API_COMMUNITY_FILES_PREFIX);
    private static final PolicyFactory VOC_POLICY = policyForFilesPrefix(API_VOC_FILES_PREFIX);

    private RichBodyHtmlSanitizer() {
    }

    private static PolicyFactory policyForFilesPrefix(String apiFilesPrefix) {
        Pattern allowedImg = Pattern.compile(
                "^" + Pattern.quote(apiFilesPrefix) + "[a-zA-Z0-9._-]+$");
        return Sanitizers.BLOCKS
                .and(Sanitizers.FORMATTING)
                .and(Sanitizers.LINKS)
                .and(new HtmlPolicyBuilder()
                        .allowElements("h1", "h2", "h3", "ol", "ul", "li", "blockquote", "pre", "code", "img")
                        .allowAttributes("alt", "width", "height")
                        .onElements("img")
                        .allowAttributes("src")
                        .matching((elementName, attributeName, value) -> sanitizeImgSrc(value, allowedImg))
                        .onElements("img")
                        .toFactory());
    }

    private static String sanitizeImgSrc(String value, Pattern allowedImg) {
        if (value == null) {
            return null;
        }
        String v = value.trim();
        if (allowedImg.matcher(v).matches()) {
            return v;
        }
        return null;
    }

    public static String sanitizeCommunity(String raw) {
        if (raw == null) {
            return "";
        }
        String normalized = PostBodyHtmlPathNormalizer.normalizeBffCommunityFilePathsToApi(raw);
        return COMMUNITY_POLICY.sanitize(normalized);
    }

    public static String sanitizeVoc(String raw) {
        if (raw == null) {
            return "";
        }
        String normalized = VocBodyHtmlPathNormalizer.normalizeBffVocFilePathsToApi(raw);
        return VOC_POLICY.sanitize(normalized);
    }
}
