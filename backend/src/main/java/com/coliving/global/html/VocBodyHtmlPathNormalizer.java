package com.coliving.global.html;

/**
 * 민원(VoC) 본문 HTML에 남을 수 있는 BFF 파일 경로를 API 규약 경로로 통일합니다.
 */
public final class VocBodyHtmlPathNormalizer {

    public static final String API_VOC_FILES_PREFIX = "/api/files/voc/";
    public static final String BFF_VOC_FILES_PREFIX = "/api/bff/files/voc/";

    private VocBodyHtmlPathNormalizer() {
    }

    public static String normalizeBffVocFilePathsToApi(String html) {
        if (html == null || html.isEmpty()) {
            return html;
        }
        return html.replace(BFF_VOC_FILES_PREFIX, API_VOC_FILES_PREFIX);
    }

    /** 첨부 {@code fileUrl} 비교용: BFF 업로드 경로를 API 규약으로 맞춥니다. */
    public static String normalizeAttachmentUrlForMatch(String url) {
        if (url == null) {
            return "";
        }
        String t = url.trim();
        if (t.startsWith(BFF_VOC_FILES_PREFIX)) {
            return API_VOC_FILES_PREFIX + t.substring(BFF_VOC_FILES_PREFIX.length());
        }
        return t;
    }
}
