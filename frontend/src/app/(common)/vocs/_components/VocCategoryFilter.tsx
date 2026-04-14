import Link from "next/link";
import { cn } from "@/lib/utils";

const VOC_TYPES = [
  { value: "FACILITY", label: "시설" },
  { value: "NOISE", label: "소음" },
  { value: "DEVICE", label: "기기" },
  { value: "OTHER", label: "기타" },
] as const;

const VOC_STATUSES = [
  { value: "OPEN", label: "접수" },
  { value: "IN_PROGRESS", label: "처리중" },
  { value: "RESOLVED", label: "완료" },
] as const;

type Props = {
  activeCategory?: string;
  activeStatus?: string;
};

export function VocCategoryFilter({ activeCategory, activeStatus }: Props) {
  const base =
    "shrink-0 text-sm md:text-base font-bold uppercase tracking-wider transition-all whitespace-nowrap pb-2 border-b-2 border-transparent";

  function buildHref(overrides: { category?: string; status?: string }) {
    const params = new URLSearchParams();
    params.set("tab", "list");
    const cat = "category" in overrides ? overrides.category : activeCategory;
    const st = "status" in overrides ? overrides.status : activeStatus;
    if (cat) params.set("category", cat);
    if (st) params.set("status", st);
    return `/vocs?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 유형별 필터 */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        <span className="shrink-0 text-sm md:text-base font-bold uppercase tracking-wider text-primary/40 pb-2">유형별</span>
        <Link
          href={buildHref({ category: "" })}
          className={cn(
            base,
            !activeCategory
              ? "text-accent border-accent"
              : "text-primary/90 hover:text-primary",
          )}
        >
          전체
        </Link>
        {VOC_TYPES.map((c) => (
          <Link
            key={c.value}
            href={buildHref({ category: c.value })}
            className={cn(
              base,
              activeCategory === c.value
                ? "text-accent border-accent"
                : "text-primary/90 hover:text-primary",
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* 상태별 필터 */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        <span className="shrink-0 text-sm md:text-base font-bold uppercase tracking-wider text-primary/40 pb-2">상태별</span>
        <Link
          href={buildHref({ status: "" })}
          className={cn(
            base,
            !activeStatus
              ? "text-accent border-accent"
              : "text-primary/90 hover:text-primary",
          )}
        >
          전체
        </Link>
        {VOC_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={buildHref({ status: s.value })}
            className={cn(
              base,
              activeStatus === s.value
                ? "text-accent border-accent"
                : "text-primary/90 hover:text-primary",
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
