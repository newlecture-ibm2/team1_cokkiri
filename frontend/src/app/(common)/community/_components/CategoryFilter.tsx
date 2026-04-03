import Link from "next/link";
import { cn } from "@/lib/utils";
import { POST_CATEGORIES } from "../_types/community";

type Props = {
  active?: string;
};

export function CategoryFilter({ active }: Props) {
  const base =
    "shrink-0 rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-transform duration-200 hover:scale-[1.02]";

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:gap-3">
      <Link
        href="/community"
        className={cn(
          base,
          !active
            ? "border-secondary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-background text-foreground hover:border-secondary/60",
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
              ? "border-secondary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background text-foreground hover:border-secondary/60",
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
