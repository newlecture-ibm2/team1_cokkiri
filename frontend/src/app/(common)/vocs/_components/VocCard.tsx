import Link from "next/link";
import { MessageSquareText, ChevronRight } from "lucide-react";
import { vocCategoryLabel, vocStatusLabel, type VocListItem } from "../_types/vocs";
import { formatDateTimeKo } from "@/lib/format-date";
import { cn } from "@/lib/utils";

function statusStyles(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-accent/10 text-accent";
    case "IN_PROGRESS":
      return "bg-primary text-white";
    case "RESOLVED":
      return "bg-muted/10 text-muted-foreground line-through";
    case "CANCELLED":
      return "bg-destructive/10 text-destructive opacity-50";
    default:
      return "bg-muted/20 text-foreground";
  }
}

export function VocCard({ item }: { item: VocListItem }) {
  return (
    <Link 
      href={`/profile/vocs/${item.vocId}`} 
      className="group bg-white rounded-[2.5rem] p-10 md:p-14 border border-primary/5 shadow-2xl shadow-primary/5 transition-all relative overflow-hidden block"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 relative z-10 text-primary">
        <div className="flex flex-col gap-8 max-w-2xl w-full">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
              VOC-00{item.vocId}
            </span>
            <span className={cn(
               "text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full",
               statusStyles(item.status)
            )}>
              {vocStatusLabel(item.status)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-2 block">
              {vocCategoryLabel(item.category)}
            </span>
            <h2 className="text-4xl font-black tracking-tighter leading-tight group-hover:text-accent transition-colors uppercase italic line-clamp-2">
              {item.title}
            </h2>
            <p className="mt-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase leading-loose">
              Filed on — {formatDateTimeKo(item.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex h-full items-center pt-4 lg:pt-0">
           <div className="h-16 w-16 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
             <ChevronRight className="w-6 h-6 group-hover:text-white transition-colors" />
           </div>
        </div>
      </div>

      {/* Editorial background number */}
      <span className="absolute -right-10 -bottom-20 text-[25vw] font-black opacity-[0.02] select-none pointer-events-none group-hover:opacity-[0.04] transition-opacity italic">
        {String(item.vocId % 100).padStart(2, '0')}
      </span>
    </Link>
  );
}
