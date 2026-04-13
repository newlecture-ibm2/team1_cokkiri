import Link from "next/link";
import { cn } from "@/lib/utils";
import { POST_CATEGORIES } from "../_types/community";

type Props = {
  active?: string;
};

export function CategoryFilter({ active }: Props) {
  const base =
    "shrink-0 text-[clamp(0.75rem,1.4vw,1.125rem)] font-bold tracking-[0.2em] transition-all whitespace-nowrap pb-2 border-b-2 border-transparent";

  return (
    <div className="flex items-center gap-[clamp(1rem,3vw,2.5rem)] overflow-x-auto">
      <Link
        href="/community"
        className={cn(
          base,
          !active
            ? "text-accent border-accent"
            : "text-primary/90 hover:text-primary",
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
              ? "text-accent border-accent"
              : "text-primary/90 hover:text-primary",
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
