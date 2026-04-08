import Link from "next/link";
import { cn } from "@/lib/utils";
import { POST_CATEGORIES } from "../_types/community";

type Props = {
  active?: string;
};

export function CategoryFilter({ active }: Props) {
  const base =
    "shrink-0 text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap pb-2 border-b-2 border-transparent";

  return (
    <div className="flex items-center gap-10 overflow-x-auto">
      <Link
        href="/community"
        className={cn(
          base,
          !active
            ? "text-accent border-accent"
            : "text-muted-foreground opacity-40 hover:opacity-100",
        )}
      >
        ALL
      </Link>
      {POST_CATEGORIES.map((c) => (
        <Link
          key={c.value}
          href={`/community?category=${c.value}`}
          className={cn(
            base,
            active === c.value
              ? "text-accent border-accent"
              : "text-muted-foreground opacity-40 hover:opacity-100",
          )}
        >
          {c.value}
        </Link>
      ))}
    </div>
  );
}
