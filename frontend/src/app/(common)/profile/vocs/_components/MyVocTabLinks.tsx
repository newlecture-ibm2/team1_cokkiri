"use client";

import Link from "next/link";

type Tab = "register" | "list";

export function MyVocTabLinks({ active }: { active: Tab }) {
  const base =
    "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all";
  const activeClass = "bg-primary text-white shadow-lg shadow-primary/20";
  const inactiveClass =
    "bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary";

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile/vocs"
        className={`${base} ${active === "register" ? activeClass : inactiveClass}`}
      >
        민원 등록
      </Link>
      <Link
        href="/profile/vocs?tab=list"
        className={`${base} ${active === "list" ? activeClass : inactiveClass}`}
      >
        나의 민원 내역
      </Link>
    </div>
  );
}
