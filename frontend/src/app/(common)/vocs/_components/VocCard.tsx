import Link from "next/link";
import { vocCategoryLabel, vocStatusLabel, type VocListItem } from "../_types/vocs";
import { formatDateTimeKo } from "@/lib/format-date";
import { cn } from "@/lib/utils";

function statusStyles(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-accent/10 text-accent";
    case "IN_PROGRESS":
      return "bg-primary/10 text-primary";
    case "RESOLVED":
      return "bg-primary/5 text-primary/50";
    case "CANCELLED":
      return "bg-destructive/10 text-destructive/70";
    default:
      return "bg-primary/5 text-primary/50";
  }
}

export function VocCard({ item }: { item: VocListItem }) {
  const isResolved = item.status === "RESOLVED" || item.status === "CANCELLED";

  return (
    <Link
      href={`/vocs/${item.vocId}`}
      className={cn(
        "group relative rounded-xl p-5 md:p-6 border transition-all overflow-hidden block cursor-pointer active:scale-[0.99]",
        isResolved
          ? "bg-background border-primary/10 hover:bg-primary/3"
          : "bg-white border-primary/15 border-l-4 border-l-accent shadow-sm hover:shadow-md hover:border-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="space-y-2 min-w-0">
          {/* 메타: 상태 배지 + 카테고리 + 번호 */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-base font-bold tracking-tight",
                statusStyles(item.status),
              )}
            >
              {item.status === "OPEN" && (
                <span className="size-2 rounded-full bg-accent animate-pulse" aria-hidden />
              )}
              {vocStatusLabel(item.status)}
            </span>
            <span className="text-base font-medium tracking-tight text-primary/50">
              {vocCategoryLabel(item.category)}
            </span>
            <span className="text-base font-normal tracking-tight text-primary/30">
              #{item.vocId}
            </span>
          </div>
          <h2
            className={cn(
              "text-xl md:text-2xl font-semibold tracking-tight leading-snug transition-colors line-clamp-2",
              isResolved ? "text-primary/70" : "text-primary group-hover:text-accent",
            )}
          >
            {item.title}
          </h2>
        </div>
        <span className="shrink-0 text-base font-medium tracking-tight text-primary/40 whitespace-nowrap pt-1">
          {formatDateTimeKo(item.createdAt)}
        </span>
      </div>
    </Link>
  );
}
