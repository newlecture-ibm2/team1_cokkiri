import Link from "next/link";
import { cn } from "@/lib/utils";
import { POST_CATEGORIES } from "../_types/community";

type Props = {
  active?: string;
};

export function CategoryFilter({ active }: Props) {
  const base =
    "shrink-0 text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap";

  return (
    <div className="flex items-center gap-10 overflow-x-auto pb-2 md:pb-0">
      <Link
        href="/community"
        className={cn(
          base,
          !active
            ? "text-accent underline underline-offset-8"
            : "opacity-40 hover:opacity-100",
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
              ? "text-accent underline underline-offset-8"
              : "opacity-40 hover:opacity-100",
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
