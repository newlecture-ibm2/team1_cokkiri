import { headers } from "next/headers";

/**
 * 서버 컴포넌트(RSC) 전용 BFF fetch 유틸리티.
 * 쿠키를 전달해 BFF → 백엔드로 인증을 유지한다.
 *
 * Docker 환경에서는 INTERNAL_FRONTEND_URL(예: http://frontend:3000)을 사용하고,
 * 로컬 개발 환경에서는 요청 헤더의 host를 기반으로 URL을 구성한다.
 */
export async function bffFetch(pathWithQuery: string, init?: RequestInit) {
  const h = await headers();

  const internalBase = process.env.INTERNAL_FRONTEND_URL;
  let url: string;

  if (internalBase) {
    // Docker 환경: 컨테이너 내부 서비스명으로 직접 호출
    url = `${internalBase.replace(/\/$/, "")}/api/${pathWithQuery.replace(/^\//, "")}`;
  } else {
    // 로컬 개발 환경: 요청 헤더 기반
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? "http";
    url = `${proto}://${host}/api/${pathWithQuery.replace(/^\//, "")}`;
  }

  return fetch(url, {
    ...init,
    method: init?.method ?? "GET",
    headers: {
      ...(init?.headers as Record<string, string>),
      cookie: h.get("cookie") ?? "",
    },
    cache: "no-store",
  });
}
