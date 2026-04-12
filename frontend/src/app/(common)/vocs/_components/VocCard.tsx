import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { vocCategoryLabel, vocStatusLabel, type VocListItem } from "../_types/vocs";
import { formatDateTimeKo } from "@/lib/format-date";
import { cn } from "@/lib/utils";

function statusStyles(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-accent/10 text-accent border-accent/30";
    case "IN_PROGRESS":
      return "bg-primary/10 text-primary border-primary/20";
    case "RESOLVED":
      return "bg-primary/5 text-primary/40 border-primary/10";
    case "CANCELLED":
      return "bg-destructive/10 text-destructive border-destructive/20 opacity-60";
    default:
      return "bg-primary/5 text-primary/50 border-primary/10";
  }
}

export function VocCard({ item }: { item: VocListItem }) {
  return (
    <Link 
      href={`/profile/vocs/${item.vocId}`} 
      className="group relative rounded-[clamp(1rem,2vw,2rem)] p-[clamp(1.25rem,3vw,2.5rem)] bg-primary/5 border border-primary/10 overflow-hidden transition-all hover:bg-primary/10 block"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-[clamp(1rem,2vw,2rem)] relative z-10">
        <div className="flex flex-col gap-[clamp(0.5rem,1.5vw,1.5rem)] min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[clamp(0.55rem,0.8vw,0.65rem)] font-medium tracking-wider text-primary/30">
              VOC-{String(item.vocId).padStart(3, '0')}
            </span>
            <span className={cn(
               "text-[clamp(0.55rem,0.8vw,0.65rem)] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-lg border",
               statusStyles(item.status)
            )}>
              {vocStatusLabel(item.status)}
            </span>
            <span className="text-[clamp(0.55rem,0.8vw,0.65rem)] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
              {vocCategoryLabel(item.category)}
            </span>
          </div>

          <div>
            <h2 className="text-[clamp(1rem,2vw,1.5rem)] font-bold tracking-tight leading-snug group-hover:text-accent transition-colors line-clamp-2">
              {item.title}
            </h2>
            <p className="mt-[clamp(0.25rem,0.5vw,0.5rem)] text-[clamp(0.65rem,1vw,0.8rem)] font-medium tracking-tight text-primary/50">
              {formatDateTimeKo(item.createdAt)}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
           <div className="h-[clamp(2rem,3.5vw,3rem)] w-[clamp(2rem,3.5vw,3rem)] rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
             <ChevronRight className="w-[clamp(0.75rem,1.2vw,1rem)] h-[clamp(0.75rem,1.2vw,1rem)] group-hover:text-white transition-colors" />
           </div>
        </div>
      </div>

      {/* Watermark */}
      <span className="absolute -right-4 -bottom-6 text-[clamp(4rem,10vw,8rem)] font-black opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.06] transition-opacity leading-none">
        {String(item.vocId % 100).padStart(2, '0')}
      </span>
    </Link>
  );
}
