"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, ShieldCheck, LogOut, ExternalLink, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onOpenMenu: () => void;
};

export function AdminLayoutHeader({ onOpenMenu }: Props) {
  return (
    <motion.header
      className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onOpenMenu}
            aria-label="사이드 메뉴 열기"
          >
            <Menu className="size-5 text-primary" />
          </Button>
          <Link href="/admin" className="group flex min-w-0 items-center gap-2">
            <ShieldCheck className="size-6 shrink-0 text-secondary" aria-hidden />
            <div className="min-w-0">
              <span className="block truncate font-black text-sm uppercase tracking-tight text-primary md:text-base">
                CoKkiri Admin
              </span>
              <span className="hidden font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:block">
                Operations
              </span>
            </div>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className="hidden text-primary sm:inline-flex" aria-label="알림">
            <Bell className="size-5" />
          </Button>
          <Link
            href="/"
            className="hidden h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 font-black text-[10px] uppercase tracking-wider transition-colors hover:bg-muted/50 md:inline-flex"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            입주민 사이트
          </Link>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-2 py-1.5 pl-3 md:px-3">
            <div className="hidden text-right sm:block">
              <p className="font-black text-[10px] uppercase tracking-wider text-muted-foreground">Administrator</p>
              <p className="truncate text-xs font-bold text-foreground">관리자</p>
            </div>
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black uppercase text-primary-foreground"
              aria-hidden
            >
              AD
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/5 hover:text-destructive"
            aria-label="로그아웃"
          >
            <LogOut className="size-5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
