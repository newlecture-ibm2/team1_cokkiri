import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  baseQuery: string;
  pageSize?: number;
};

/** `/admin/voc` 목록 전용 페이지네이션. */
export function AdminVocPaginationBar({ page, totalPages, baseQuery, pageSize }: Props) {
  if (totalPages <= 1) return null;

  const q = baseQuery ? `${baseQuery}&` : "";
  const sz = pageSize != null && pageSize !== 20 ? `s=${pageSize}&` : "";
  const base = "/admin/voc";
  const prev = page > 0 ? `${base}?${q}${sz}p=${page - 1}` : null;
  const next = page < totalPages - 1 ? `${base}?${q}${sz}p=${page + 1}` : null;

  const btn =
    "inline-flex items-center gap-1.5 rounded-xl border px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-transform duration-200";

  return (
    <nav className="mt-12 flex items-center justify-center gap-6" aria-label="페이지 이동">
      {prev ? (
        <Link
          href={prev}
          className={cn(btn, "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-secondary/70")}
        >
          <ChevronLeft className="size-4" aria-hidden />
          이전
        </Link>
      ) : (
        <span className={cn(btn, "cursor-not-allowed border-muted text-muted-foreground opacity-50")}>
          <ChevronLeft className="size-4" aria-hidden />
          이전
        </span>
      )}
      <span className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        {page + 1} / {totalPages}
      </span>
      {next ? (
        <Link
          href={next}
          className={cn(btn, "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-secondary/70")}
        >
          다음
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={cn(btn, "cursor-not-allowed border-muted text-muted-foreground opacity-50")}>
          다음
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
