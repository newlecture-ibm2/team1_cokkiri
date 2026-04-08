/** `searchParams` await 결과 등 단일 문자열 값 위주 */
export type SearchParamsLike = Record<string, string | string[] | undefined>;

function param(sp: SearchParamsLike, key: string): string {
  const v = sp[key];
  if (v == null) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

/** 목록 API·페이지네이션용 쿼리스트링 (필터 1개만 적용) */
export function buildAdminVocListApiQuery(sp: SearchParamsLike): string {
  const status = param(sp, "status").trim();
  const all = param(sp, "all") === "1" || param(sp, "all") === "true";
  const pending = param(sp, "pending") === "true" || param(sp, "pending") === "1";

  const qs = new URLSearchParams();
  if (pending) qs.set("pending", "true");
  else if (all) {
    /* 전체: status·pending 생략 (백엔드 기본 목록) */
  } else if (status) qs.set("status", status);
  else qs.set("pending", "true");

  const page = Math.max(0, parseInt(param(sp, "p") || "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(param(sp, "s") || "20", 10) || 20));
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", "createdAt,desc");
  return qs.toString();
}

/** 페이지네이션 링크에 붙일 필터 부분 (p, s 제외) */
export function buildAdminVocListBaseQuery(sp: SearchParamsLike): string {
  const status = param(sp, "status").trim();
  const all = param(sp, "all") === "1" || param(sp, "all") === "true";
  const pending = param(sp, "pending") === "true" || param(sp, "pending") === "1";

  if (pending) return "pending=true";
  if (all) return "all=1";
  if (status) return `status=${encodeURIComponent(status)}`;
  return "pending=true";
}

export function parseAdminVocListScope(sp: SearchParamsLike): {
  pending: boolean;
  all: boolean;
  status: string;
} {
  const status = param(sp, "status").trim();
  const all = param(sp, "all") === "1" || param(sp, "all") === "true";
  const pending = param(sp, "pending") === "true" || param(sp, "pending") === "1";
  return { pending, all, status };
}

export function adminVocListNeedsDefaultRedirect(sp: SearchParamsLike): boolean {
  const status = param(sp, "status").trim();
  const all = param(sp, "all") === "1" || param(sp, "all") === "true";
  const pending = param(sp, "pending") === "true" || param(sp, "pending") === "1";
  return !pending && !all && !status;
}

/** `/admin/vocs` 단독 진입 시 미처리 큐로 보냄(p·s 유지) */
export function redirectToDefaultAdminVocList(sp: SearchParamsLike): string {
  const qs = new URLSearchParams();
  qs.set("pending", "true");
  const p = param(sp, "p");
  const s = param(sp, "s");
  if (p) qs.set("p", p);
  if (s) qs.set("s", s);
  return `/admin/vocs?${qs.toString()}`;
}
