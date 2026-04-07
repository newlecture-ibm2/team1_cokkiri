"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";

type LoginRequiredModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  loginHref?: string;
};

export function LoginRequiredModal({
  isOpen,
  onClose,
  title = LOGIN_REQUIRED_MESSAGE,
  description = "로그인 후 커뮤니티·댓글·민원·알림 기능을 이용할 수 있습니다.",
  loginHref = "/login",
}: LoginRequiredModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="relative w-full max-w-sm rounded-[1.75rem] border border-border bg-background p-7 shadow-2xl"
          >
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="size-7 text-destructive" aria-hidden />
            </div>
            <h3 className="text-center text-2xl font-black tracking-tight text-foreground">{title}</h3>
            <p className="mt-3 text-center text-sm font-medium tracking-tight text-muted-foreground">{description}</p>
            <div className="mt-7 flex flex-col gap-2">
              <Link
                href={loginHref}
                className="w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-black uppercase tracking-wider text-primary-foreground"
              >
                로그인 페이지로 이동
              </Link>
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-border bg-muted/30 px-5 py-3 text-sm font-black uppercase tracking-wider text-foreground"
                >
                  닫기
                </button>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
