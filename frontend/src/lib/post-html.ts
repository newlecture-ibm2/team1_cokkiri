/**
 * 길이 제한은 Java `@Size` / JavaScript `String.length`와 동일한 **UTF-16 코드 유닛** 기준입니다.
 * (이모지 등은 2칸으로 잡힐 수 있습니다.)
 */
export const POST_TITLE_MAX_LENGTH = 100;

/** 백엔드 `PostMultipartRequestDto.content` @Size(max) 와 동일 (UTF-16 코드 유닛). */
export const POST_BODY_HTML_MAX_LENGTH = 65535;

/**
 * 본문 HTML의 커뮤니티 파일 URL을 BFF 경로로 바꿉니다 (브라우저에서 쿠키 인증으로 파일 접근).
 * 백엔드 `PostBodyHtmlPathNormalizer.API_COMMUNITY_FILES_PREFIX` ↔ BFF 규약과 이름을 맞춤.
 */
export function normalizePostBodyApiCommunityUrlsToBff(html: string): string {
  if (!html) return html;
  return html.replaceAll("/api/files/community/", "/api/files/community/");
}

/** 저장 직전: BFF 경로를 API 규약 경로로 되돌립니다. */
export function normalizePostBodyBffCommunityUrlsToApi(html: string): string {
  if (!html) return html;
  return html.replaceAll("/api/files/community/", "/api/files/community/");
}

/**
 * Quill 등에서 온 “진짜 HTML 본문”인지 판별합니다.
 * `3 < 5`, `a < b` 같은 플레인 텍스트는 HTML로 보지 않습니다.
 */
export function isRichTextBodyHtml(content: string): boolean {
  const t = content.trimStart();
  if (!t.startsWith("<")) return false;
  return /^\s*<(p|div|h[1-6]|ul|ol|li|blockquote|pre|code|img|br|span|strong|em|table|figure|a)(\s|[\/>])/i.test(
    t,
  );
}

export function plainTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\u00a0/g, " ").trim();
}

/**
 * 상세 페이지용: 업로드 이미지(`/api/files/community/...`)만 BFF로 바꿉니다.
 * 외부 URL 이미지·링크 펼치기는 폐쇄형 정책으로 하지 않습니다.
 */
export function prepareCommunityPostBodyForDisplay(html: string): string {
  let result = normalizePostBodyApiCommunityUrlsToBff(html);

  // <a> 태그 후처리: 프로토콜 없는 href에 https:// 추가, target="_blank" + rel 추가
  result = result.replace(
    /<a\s+([^>]*?)href="([^"]*)"([^>]*?)>/gi,
    (_match, before: string, href: string, after: string) => {
      let fixedHref = href.trim();

      // 프로토콜이 없으면 https:// 추가 (상대 경로 방지)
      if (
        fixedHref &&
        !fixedHref.startsWith("http://") &&
        !fixedHref.startsWith("https://") &&
        !fixedHref.startsWith("mailto:") &&
        !fixedHref.startsWith("tel:") &&
        !fixedHref.startsWith("/") &&
        !fixedHref.startsWith("#")
      ) {
        fixedHref = `https://${fixedHref}`;
      }

      // 기존 target/rel 제거 후 새로 추가
      const attrs = `${before}${after}`
        .replace(/target="[^"]*"/gi, "")
        .replace(/rel="[^"]*"/gi, "")
        .trim();

      return `<a ${attrs} href="${fixedHref}" target="_blank" rel="noopener noreferrer">`.replace(/\s+/g, " ");
    },
  );

  return result;
}
