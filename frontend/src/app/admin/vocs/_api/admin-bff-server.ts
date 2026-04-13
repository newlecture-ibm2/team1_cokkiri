import { bffFetch } from "@/lib/bff-fetch";

/** 관리자 VoC RSC 전용: 쿠키를 BFF로 전달합니다. */
export async function adminBffGet(pathWithQuery: string, init?: RequestInit) {
  return bffFetch(pathWithQuery, { ...init, method: "GET" });
}
