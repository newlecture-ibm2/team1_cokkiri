import { headers } from "next/headers";

/** 서버 컴포넌트 전용. 쿠키를 BFF로 전달합니다. */
export async function bffGet(pathWithQuery: string, init?: RequestInit) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/${pathWithQuery.replace(/^\//, "")}`;

  return fetch(url, {
    ...init,
    method: "GET",
    headers: {
      ...(init?.headers as Record<string, string>),
      cookie: h.get("cookie") ?? "",
    },
    cache: "no-store",
  });
}
