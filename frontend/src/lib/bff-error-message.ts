/** 본문이 이 길이 미만일 때만 그대로 노출 (기존 댓글 UI와 동일) */
const MAX_BODY_PREVIEW = 200;

/** BFF/fetch 응답 본문이 짧으면 그대로, 아니면 상태 코드 기반 메시지 */
export async function bffErrorMessageFromResponse(res: Response): Promise<string> {
  try {
    const t = await res.text();
    if (t && t.length < MAX_BODY_PREVIEW) return t;
  } catch {
    /* ignore */
  }
  return `처리하지 못했습니다. (${res.status})`;
}
