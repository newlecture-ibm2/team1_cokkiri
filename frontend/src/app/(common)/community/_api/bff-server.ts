import { bffFetch } from "@/lib/bff-fetch";

/**
 * 서버 컴포넌트에서만 사용. 쿠키를 전달해 BFF → 백엔드로 인증 유지.
 */
export async function bffGet(pathWithQuery: string, init?: RequestInit) {
  return bffFetch(pathWithQuery, { ...init, method: "GET" });
}
