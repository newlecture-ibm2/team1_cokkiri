/** `searchParams` await 결과 등 단일 문자열 값 위주 */
export type SearchParamsLike = Record<string, string | string[] | undefined>;

function param(sp: SearchParamsLike, key: string): string {
  const v = sp[key];
  if (v == null) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

/** 목록 API용 쿼리스트링 (다중 필터 지원) */
export function buildAdminVocListApiQuery(sp: SearchParamsLike): string {
  const category = param(sp, "category").trim();
  const status = param(sp, "status").trim();
  const query = param(sp, "q").trim();
  const sort = param(sp, "sort").trim() || "createdAt,desc";
  const createdFrom = param(sp, "createdFrom").trim();
  const createdTo = param(sp, "createdTo").trim();
  const pending = param(sp, "pending").trim();
  const all = param(sp, "all").trim();
  const pendingOnly = pending === "true" || pending === "1";
  const showAll = all === "1" || all.toLowerCase() === "true";

  const qs = new URLSearchParams();
  if (pendingOnly) {
    qs.set("pending", "true");
  } else {
    if (category) qs.set("category", category);
    if (status) qs.set("status", status);
    if (showAll) qs.set("all", "1");
  }
  if (query) qs.set("q", query);
  if (createdFrom) qs.set("createdFrom", createdFrom);
  if (createdTo) qs.set("createdTo", createdTo);
  qs.set("sort", sort);

  const page = Math.max(0, parseInt(param(sp, "p") || "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(param(sp, "s") || "20", 10) || 20));
  qs.set("p", String(page));
  qs.set("s", String(size));
  
  return qs.toString();
}

/** 페이지네이션 링크에 붙일 필터 부분 (p, s 제외) */
export function buildAdminVocListBaseQuery(sp: SearchParamsLike): string {
  const category = param(sp, "category").trim();
  const status = param(sp, "status").trim();
  const query = param(sp, "q").trim();
  const sort = param(sp, "sort").trim();
  const createdFrom = param(sp, "createdFrom").trim();
  const createdTo = param(sp, "createdTo").trim();
  const pending = param(sp, "pending").trim();
  const all = param(sp, "all").trim();
  const pendingOnly = pending === "true" || pending === "1";
  const showAll = all === "1" || all.toLowerCase() === "true";

  const qs = new URLSearchParams();
  if (pendingOnly) {
    qs.set("pending", "true");
  } else {
    if (category) qs.set("category", category);
    if (status) qs.set("status", status);
    if (showAll) qs.set("all", "1");
  }
  if (query) qs.set("q", query);
  if (createdFrom) qs.set("createdFrom", createdFrom);
  if (createdTo) qs.set("createdTo", createdTo);
  if (sort && sort !== "createdAt,desc") qs.set("sort", sort);
  
  return qs.toString();
}

/** 현재 필터 상태 파싱 */
export function parseAdminVocListScope(sp: SearchParamsLike): {
  category: string;
  status: string;
} {
  const pending = param(sp, "pending").trim();
  const pendingOnly = pending === "true" || pending === "1";
  return {
    category: pendingOnly ? "" : param(sp, "category").trim(),
    status: pendingOnly ? "" : param(sp, "status").trim(),
  };
}

/** 
 * 관리자 리스트는 이제 특수한 리다이렉트 없이 
 * /admin/vocs로 바로 접근 가능하게 변경 (기본값: 전체/최신순)
 */
export function adminVocListNeedsDefaultRedirect(sp: SearchParamsLike): boolean {
  return false;
}

export function redirectToDefaultAdminVocList(sp: SearchParamsLike): string {
  return `/admin/vocs`;
}
