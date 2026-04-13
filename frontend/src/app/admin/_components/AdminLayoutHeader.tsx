"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  onOpenMenu: () => void;
};

export function AdminLayoutHeader({ onOpenMenu }: Props) {
  const { user } = useAuthStore();

  return (
    <motion.header
      className="sticky top-0 z-30 border-b border-primary/8 bg-background/85 backdrop-blur-lg"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between px-[clamp(1rem,3vw,3rem)] py-[clamp(0.375rem,0.8vw,0.75rem)]">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 lg:hidden"
            onClick={onOpenMenu}
            aria-label="사이드 메뉴 열기"
          >
            <Menu className="size-[18px] text-primary" />
          </Button>

          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-black uppercase tracking-tighter text-primary">
              COKKIRI
            </span>
            <span className="mt-1 mb-auto ml-1 rounded-md bg-secondary/15 px-2 py-0.5 text-[clamp(0.55rem,1vw,0.875rem)] font-black uppercase tracking-widest text-secondary">
              Admin
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-lg px-4 py-2 text-base font-bold tracking-wide text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary sm:inline-flex"
          >
            <ExternalLink className="size-4" aria-hidden />
            사이트 보기
          </Link>

          <div className="hidden h-5 w-px bg-border/60 sm:block" />

          <div className="flex items-center gap-2 pl-1">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-none text-primary">
                {user?.name || "관리자"}
              </p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                Administrator
              </p>
            </div>
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground"
              aria-hidden
            >
              {user?.name?.[0] || "A"}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              useAuthStore.getState().logout();
            }}
            className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-destructive/8 hover:text-destructive"
            aria-label="로그아웃"
            title="로그아웃"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
