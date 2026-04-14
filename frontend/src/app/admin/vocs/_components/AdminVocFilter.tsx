"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  { value: "CANCELLED", label: "취소" },
] as const;

type Props = {
  activeCategory?: string;
  activeStatus?: string;
};

export function AdminVocFilter({ activeCategory, activeStatus }: Props) {
  const searchParams = useSearchParams();

  const base =
    "shrink-0 text-sm md:text-base font-bold uppercase tracking-wider transition-all whitespace-nowrap pb-2 border-b-2 border-transparent";

  function buildHref(overrides: { category?: string; status?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("p"); // Reset page on filter change
    
    if ("category" in overrides) {
      if (overrides.category) params.set("category", overrides.category);
      else params.delete("category");
    }
    
    if ("status" in overrides) {
      if (overrides.status) params.set("status", overrides.status);
      else params.delete("status");
    }
    
    return `/admin/vocs?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 유형별 필터 */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 shrink-0 pb-2">
          <span className="text-sm md:text-base font-bold uppercase tracking-wider text-primary">유형별</span>
          <span className="text-primary/10 select-none">|</span>
        </div>
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
        <div className="flex items-center gap-4 shrink-0 pb-2">
          <span className="text-sm md:text-base font-bold uppercase tracking-wider text-primary">상태별</span>
          <span className="text-primary/10 select-none">|</span>
        </div>
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
