import Link from "next/link";
import { cn } from "@/lib/utils";
import { ADMIN_VOC_STATUS_FILTERS } from "../_types/admin-voc";

type Props = {
  activeStatus: string;
};

export function AdminVocStatusFilter({ activeStatus }: Props) {
  const base = "shrink-0 rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-transform duration-200 hover:scale-[1.02]";

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:gap-3">
      {ADMIN_VOC_STATUS_FILTERS.map((f) => {
        const isAll = f.value === "";
        const href = isAll ? "/admin/voc" : `/admin/voc?status=${encodeURIComponent(f.value)}`;
        const active = isAll ? activeStatus === "" : activeStatus === f.value;
        return (
          <Link
            key={f.value || "all"}
            href={href}
            className={cn(
              base,
              active
                ? "border-secondary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-foreground hover:border-secondary/60",
            )}
          >
            {f.label}
          </Link>
        );
      })}
    </div>
  );
}
