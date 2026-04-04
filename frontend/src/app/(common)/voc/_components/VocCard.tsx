import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { vocCategoryLabel, vocStatusLabel, type VocListItem } from "../_types/voc";
import { formatDateTimeKo } from "@/lib/format-date";
import { cn } from "@/lib/utils";

function statusPillClass(status: string) {
  switch (status) {
    case "OPEN":
      return "border-secondary/50 bg-secondary/10 text-secondary";
    case "IN_PROGRESS":
      return "border-primary/30 bg-primary/10 text-primary";
    case "RESOLVED":
      return "border-border bg-muted/40 text-muted-foreground";
    case "CANCELLED":
      return "border-muted text-muted-foreground opacity-80";
    default:
      return "border-border bg-muted/30 text-foreground";
  }
}

export function VocCard({ item }: { item: VocListItem }) {
  return (
    <Link
      href={`/voc/${item.vocId}`}
      className="group block rounded-[2rem] border border-border bg-background/80 p-6 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-secondary/50 md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <MessageSquareText
            className="mt-0.5 size-5 shrink-0 text-secondary opacity-80 group-hover:opacity-100"
            strokeWidth={1.5}
            aria-hidden
          />
          <div className="min-w-0 space-y-2">
            <p className="font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {vocCategoryLabel(item.category)}
            </p>
            <h2 className="font-black text-lg tracking-tight text-balance text-foreground group-hover:text-secondary md:text-xl">
              {item.title}
            </h2>
            <time
              dateTime={item.createdAt}
              className="block font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              {formatDateTimeKo(item.createdAt)}
            </time>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider",
            statusPillClass(item.status),
          )}
        >
          {vocStatusLabel(item.status)}
        </span>
      </div>
    </Link>
  );
}
