"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "register" | "list";

export function MyVocTabLinks({ active }: { active: Tab }) {
  const btn = (on: boolean) =>
    cn(
      "shrink-0 text-[clamp(0.75rem,1.4vw,1.125rem)] font-bold tracking-[0.2em] transition-all whitespace-nowrap pb-2 border-b-2",
      on
        ? "text-accent border-accent"
        : "text-primary/90 hover:text-primary border-transparent",
    );

  return (
    <nav
      className="flex items-center gap-[clamp(1rem,3vw,2.5rem)] overflow-x-auto border-b border-foreground/10 pb-[clamp(1rem,2vw,2rem)]"
      aria-label="VoC Tabs"
    >
      <Link href="/profile/vocs" className={btn(active === "register")} scroll={false}>
        등록
      </Link>
      <Link href="/profile/vocs?tab=list" className={btn(active === "list")} scroll={false}>
        내역
      </Link>
    </nav>
  );
}
