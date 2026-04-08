import type { ApiResponse } from "@/types/api";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";

const DEFAULT_SAVE_FAIL = "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";

/** 이미 파싱한 BFF JSON에서 사용자에게 보여 줄 메시지를 고릅니다. */
function apiErrorCode(json: ApiResponse<unknown>): string | undefined {
  return json.errorCode ?? json.error_code;
}

export function messageFromBffResponse<T>(
  json: ApiResponse<T>,
  fallback: string = DEFAULT_SAVE_FAIL,
): string {
  const code = apiErrorCode(json);
  if (code === "UNAUTHORIZED" || code === "INVALID_CREDENTIALS") {
    return LOGIN_REQUIRED_MESSAGE;
  }
  const m = json.message?.trim();
  if (m) return m;
  return fallback;
}

/**
 * `fetch` 응답 본문을 JSON으로 읽어 메시지를 뽑습니다.
 * (댓글·VoC 등 기존 컴포넌트에서 사용)
 */
export async function bffErrorMessageFromResponse(
  res: Response,
  fallback: string = DEFAULT_SAVE_FAIL,
): Promise<string> {
  if (res.status === 401) {
    return LOGIN_REQUIRED_MESSAGE;
  }
  try {
    const json = (await res.json()) as ApiResponse<unknown>;
    return messageFromBffResponse(json, fallback);
  } catch {
    return "서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }
}
