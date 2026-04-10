"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldX } from "lucide-react";

type AccessDeniedModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
};

/**
 * 입주자(RESIDENT) 이상 권한이 필요한 작업을 일반 회원(USER)이
 * 시도했을 때 표시하는 안내 팝업입니다.
 */
export function AccessDeniedModal({
  isOpen,
  onClose,
  title = "입주자 전용 기능입니다",
  description = "게시글·댓글·민원 등록은 입주 계약을 완료한 입주자만 이용할 수 있습니다.\n입주 신청 후 계약이 체결되면 자동으로 권한이 부여됩니다.",
}: AccessDeniedModalProps) {
  const router = useRouter();

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
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-amber-500/10">
              <ShieldX className="size-7 text-amber-600" aria-hidden />
            </div>
            <h3 className="text-center text-2xl font-black tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-3 text-center text-sm font-medium tracking-tight text-muted-foreground whitespace-pre-line">
              {description}
            </p>
            <div className="mt-7 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => router.push("/rooms")}
                className="w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-black uppercase tracking-wider text-primary-foreground transition-colors hover:bg-accent"
              >
                방 둘러보기
              </button>
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-border bg-muted/30 px-5 py-3 text-sm font-black uppercase tracking-wider text-foreground transition-colors hover:bg-muted/50"
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
