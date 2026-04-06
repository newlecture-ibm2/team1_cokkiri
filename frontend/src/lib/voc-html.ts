/**
 * VoC 본문 길이는 백엔드 `@Size` / JS `String.length`와 동일한 **UTF-16 코드 유닛** 기준입니다.
 */
export const VOC_TITLE_MAX_LENGTH = 200;

/** `VocMultipartRequestDto` / `VocUpdateMultipartRequestDto.content` 와 동일. */
export const VOC_BODY_HTML_MAX_LENGTH = 65535;

/** 민원 본문의 `/api/files/voc/...` 를 BFF 경로로 바꿉니다. */
export function normalizeVocApiFileUrlsToBff(html: string): string {
  if (!html) return html;
  return html.replaceAll("/api/files/voc/", "/api/bff/files/voc/");
}

/** 저장 직전: BFF 경로를 API 규약으로 되돌립니다. */
export function normalizeVocBffFileUrlsToApi(html: string): string {
  if (!html) return html;
  return html.replaceAll("/api/bff/files/voc/", "/api/files/voc/");
}

/** 상세 화면용: 업로드 파일 URL만 BFF로 (폐쇄형, 외부 이미지 없음). */
export function prepareVocBodyForDisplay(html: string): string {
  return normalizeVocApiFileUrlsToBff(html);
}

/** 사용자·관리자 VoC 상세 본문 `dangerouslySetInnerHTML` 용 Tailwind 묶음 */
export const VOC_RICH_BODY_CLASSNAME =
  "voc-post-html [&_img]:my-4 [&_img]:max-h-[min(70vh,520px)] [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-contain [&_p]:mb-3 [&_a]:break-all [&_a]:font-medium [&_a]:text-secondary [&_a]:underline [&_a]:decoration-secondary/50 [&_a]:underline-offset-4 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-secondary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/30 [&_pre]:p-4 [&_code]:text-sm";
