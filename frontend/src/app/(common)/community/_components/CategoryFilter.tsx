import Link from "next/link";
import { cn } from "@/lib/utils";
import { POST_CATEGORIES } from "../_types/community";

type Props = {
  active?: string;
};

export function CategoryFilter({ active }: Props) {
  const base =
    "shrink-0 rounded-full border px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.24em] transition-colors";

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
      <Link
        href="/community"
        className={cn(
          base,
          !active
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-background text-foreground/75 hover:border-secondary/60 hover:text-foreground",
        )}
      >
        전체
      </Link>
      {POST_CATEGORIES.map((c) => (
        <Link
          key={c.value}
          href={`/community?category=${c.value}`}
          className={cn(
            base,
            active === c.value
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background text-foreground/75 hover:border-secondary/60 hover:text-foreground",
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
