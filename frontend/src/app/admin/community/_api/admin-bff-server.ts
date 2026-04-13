import { bffFetch } from "@/lib/bff-fetch";

/** 관리자 커뮤니티 RSC 전용: 쿠키를 BFF로 전달합니다. */
export async function adminCommunityBffGet(pathWithQuery: string, init?: RequestInit) {
  return bffFetch(pathWithQuery, { ...init, method: "GET" });
}
