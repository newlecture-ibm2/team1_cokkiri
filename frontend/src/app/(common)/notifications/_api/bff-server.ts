import { bffFetch } from "@/lib/bff-fetch";

/** 서버 컴포넌트 전용. 쿠키를 BFF로 전달합니다. */
export async function bffGet(pathWithQuery: string, init?: RequestInit) {
  return bffFetch(pathWithQuery, { ...init, method: "GET" });
}
