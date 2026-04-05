package com.coliving.global.html;

/**
 * 게시글 본문 HTML에 남을 수 있는 BFF 파일 경로를 API 규약 경로로 통일합니다.
 * (프론트 표시용 BFF URL이 본문에 섞여 저장된 경우 정규화)
 */
public final class PostBodyHtmlPathNormalizer {

    public static final String API_COMMUNITY_FILES_PREFIX = "/api/files/community/";
    public static final String BFF_COMMUNITY_FILES_PREFIX = "/api/bff/files/community/";

    private PostBodyHtmlPathNormalizer() {
    }

    public static String normalizeBffCommunityFilePathsToApi(String html) {
        if (html == null || html.isEmpty()) {
            return html;
        }
        return html.replace(BFF_COMMUNITY_FILES_PREFIX, API_COMMUNITY_FILES_PREFIX);
    }

    /** 첨부 {@code fileUrl} 비교용: BFF 업로드 경로를 API 규약으로 맞춥니다. */
    public static String normalizeAttachmentUrlForMatch(String url) {
        if (url == null) {
            return "";
        }
        String t = url.trim();
        if (t.startsWith(BFF_COMMUNITY_FILES_PREFIX)) {
            return API_COMMUNITY_FILES_PREFIX + t.substring(BFF_COMMUNITY_FILES_PREFIX.length());
        }
        return t;
    }
}
