import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { adminVocCategoryLabel, adminVocStatusLabel, type AdminVocListItem } from "../_types/admin-vocs";
import { formatDateTimeKo } from "@/lib/format-date";
import { cn } from "@/lib/utils";

function statusPillClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-[#7F1D1D]/5 text-[#7F1D1D] border-[#7F1D1D]/20";
    case "IN_PROGRESS":
      return "bg-blue-600/5 text-blue-600/80 border-blue-600/20";
    case "RESOLVED":
      return "bg-[#4A7C6F]/5 text-[#4A7C6F]/80 border-[#4A7C6F]/20";
    case "CANCELLED":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-stone-50 text-stone-400 border-stone-200";
  }
}

export function AdminVocListCard({ item }: { item: AdminVocListItem }) {
  return (
    <Link
      href={`/admin/vocs/${item.vocId}`}
      className="group block rounded-[2.5rem] border border-stone-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/5"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-6">
          <div className="mt-1 bg-stone-100 rounded-2xl p-3.5 shrink-0 group-hover:bg-stone-200 transition-colors">
            <ClipboardList
              className="size-6 text-stone-700"
              strokeWidth={2.5}
              aria-hidden
            />
          </div>
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-medium text-sm uppercase tracking-widest text-stone-600">
                {adminVocCategoryLabel(item.category)}
              </span>
              <span className="text-stone-300 text-sm">·</span>
              <span className="font-medium text-sm text-stone-800">
                {item.userName || `회원 #${item.userId}`}
              </span>
            </div>
            <h2 className="font-normal text-2xl tracking-tight text-stone-900 group-hover:text-secondary md:text-3xl transition-colors line-clamp-1">
              {item.title}
            </h2>
            <time
              dateTime={item.createdAt}
              className="block font-medium text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-stone-400"
              suppressHydrationWarning
            >
              {formatDateTimeKo(item.createdAt)}
            </time>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium uppercase tracking-tight",
            statusPillClass(item.status),
          )}
          suppressHydrationWarning
        >
          {adminVocStatusLabel(item.status)}
        </span>
      </div>
    </Link>
  );
}
