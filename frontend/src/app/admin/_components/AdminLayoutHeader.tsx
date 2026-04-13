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
      <div className="flex h-14 items-center justify-between px-4 md:px-6 lg:px-8">
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
            <span className="text-base font-black uppercase tracking-tight text-primary md:text-lg">
              CoKkiri
            </span>
            <span className="rounded-md bg-secondary/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-secondary">
              Admin
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wide text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary sm:inline-flex"
          >
            <ExternalLink className="size-3" aria-hidden />
            사이트 보기
          </Link>

          <div className="hidden h-5 w-px bg-border/60 sm:block" />

          <div className="flex items-center gap-2 pl-1">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold leading-none text-primary">
                {user?.name || "관리자"}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                Administrator
              </p>
            </div>
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground"
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
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-destructive/8 hover:text-destructive"
            aria-label="로그아웃"
            title="로그아웃"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
