"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "register" | "list";

export function MyVocTabLinks({ active }: { active: Tab }) {
  const btn = (on: boolean) =>
    cn(
      "shrink-0 pb-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 whitespace-nowrap",
      on
        ? "text-accent border-accent"
        : "text-muted-foreground opacity-40 hover:opacity-100 border-transparent",
    );

  return (
    <nav
      className="flex items-center gap-10 overflow-x-auto border-b border-primary/10 pb-8"
      aria-label="VoC Tabs"
    >
      <Link href="/profile/vocs" className={btn(active === "register")} scroll={false}>
        REGISTER
      </Link>
      <Link href="/profile/vocs?tab=list" className={btn(active === "list")} scroll={false}>
        HISTORY
      </Link>
    </nav>
  );
}
