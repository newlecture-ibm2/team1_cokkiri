"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { POST_CATEGORIES } from "@/app/(common)/community/_types/community";

type Props = {
  activeCategory?: string;
};

export function MyPostCategoryFilter({ activeCategory }: Props) {
  const searchParams = useSearchParams();
  
  const base =
    "shrink-0 text-sm md:text-base font-bold uppercase tracking-wider transition-all whitespace-nowrap pb-2 border-b-2 border-transparent";

  function buildHref(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("p");
    if (category) params.set("category", category);
    else params.delete("category");
    return `/my-posts?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 shrink-0 pb-2">
          <span className="text-sm md:text-base font-bold uppercase tracking-wider text-primary">유형별</span>
          <span className="text-primary/10 select-none">|</span>
        </div>
        <Link
          href={buildHref("")}
          className={cn(
            base,
            !activeCategory
              ? "text-accent border-accent"
              : "text-primary/90 hover:text-primary",
          )}
        >
          전체
        </Link>
        {POST_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={buildHref(c.value)}
            className={cn(
              base,
              activeCategory === c.value
                ? "text-accent border-accent"
                : "text-primary/90 hover:text-primary",
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
