import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  baseQuery: string;
  pageSize?: number;
};

/**
 * VOC Admin 전용 페이지네이션 바
 * [처음] [이전] 1 2 3 4 5 [다음] [끝] 형태로 개선
 */
export function AdminVocPaginationBar({ page, totalPages, baseQuery, pageSize }: Props) {
  if (totalPages <= 1) return null;

  const current = page; // 0-based
  const maxPages = totalPages;
  const q = baseQuery ? `${baseQuery}&` : "";
  const sz = pageSize != null && pageSize !== 20 ? `s=${pageSize}&` : "";
  const base = "/admin/vocs";

  const getUrl = (p: number) => `${base}?${q}${sz}p=${p}`;

  // 페이지 번호 계산 (현재 페이지 기준 좌우 2개씩 표시)
  const range = 2;
  const start = Math.max(0, current - range);
  const end = Math.min(maxPages - 1, current + range);

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const navBtnBase = "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5";
  const numBtnBase = "flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5";

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {/* 처음으로 */}
      <Link
        href={getUrl(0)}
        className={cn(
          navBtnBase,
          current === 0
            ? "pointer-events-none border-primary/5 text-primary/20 bg-primary/5"
            : "border-primary/10 text-primary/60 hover:border-accent hover:text-accent bg-white shadow-sm"
        )}
        title="처음 페이지"
      >
        <ChevronsLeft className="size-4" />
      </Link>

      {/* 이전 */}
      <Link
        href={getUrl(Math.max(0, current - 1))}
        className={cn(
          navBtnBase,
          current === 0
            ? "pointer-events-none border-primary/5 text-primary/20 bg-primary/5"
            : "border-primary/10 text-primary/60 hover:border-accent hover:text-accent bg-white shadow-sm"
        )}
        title="이전 페이지"
      >
        <ChevronLeft className="size-4" />
      </Link>

      {/* 페이지 번호 */}
      <div className="mx-2 flex items-center gap-1.5">
        {start > 0 && <span className="text-primary/20 px-1 font-black">...</span>}
        {pages.map((p) => (
          <Link
            key={p}
            href={getUrl(p)}
            className={cn(
              numBtnBase,
              p === current
                ? "border-accent bg-accent text-white shadow-md shadow-accent/20"
                : "border-primary/10 text-primary/70 hover:border-accent hover:text-accent bg-white shadow-sm"
            )}
          >
            {p + 1}
          </Link>
        ))}
        {end < maxPages - 1 && <span className="text-primary/20 px-1 font-black">...</span>}
      </div>

      {/* 다음 */}
      <Link
        href={getUrl(Math.min(maxPages - 1, current + 1))}
        className={cn(
          navBtnBase,
          current === maxPages - 1
            ? "pointer-events-none border-primary/5 text-primary/20 bg-primary/5"
            : "border-primary/10 text-primary/60 hover:border-accent hover:text-accent bg-white shadow-sm"
        )}
        title="다음 페이지"
      >
        <ChevronRight className="size-4" />
      </Link>

      {/* 끝으로 */}
      <Link
        href={getUrl(maxPages - 1)}
        className={cn(
          navBtnBase,
          current === maxPages - 1
            ? "pointer-events-none border-primary/5 text-primary/20 bg-primary/5"
            : "border-primary/10 text-primary/60 hover:border-accent hover:text-accent bg-white shadow-sm"
        )}
        title="마지막 페이지"
      >
        <ChevronsRight className="size-4" />
      </Link>
    </nav>
  );
}
