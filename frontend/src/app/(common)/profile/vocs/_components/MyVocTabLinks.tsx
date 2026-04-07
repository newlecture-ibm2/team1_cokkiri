"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "register" | "list";

export function MyVocTabLinks({ active }: { active: Tab }) {
  const btn = (on: boolean) =>
    cn(
      "inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] transition-colors md:px-6 md:text-sm",
      on
        ? "bg-primary text-primary-foreground shadow-sm"
        : "border border-border bg-background text-primary/70 hover:border-secondary/40 hover:text-primary",
    );

  return (
    <nav
      className="mb-10 flex flex-wrap gap-2 border-b border-border pb-6"
      aria-label="민원 메뉴"
    >
      <Link href="/profile/vocs" className={btn(active === "register")} scroll={false}>
        민원 등록
      </Link>
      <Link href="/profile/vocs?tab=list" className={btn(active === "list")} scroll={false}>
        나의 민원 내역
      </Link>
    </nav>
  );
}
