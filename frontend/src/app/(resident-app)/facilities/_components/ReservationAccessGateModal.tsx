"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

type GateReason = "LOGIN_REQUIRED" | "RESIDENT_ONLY";

interface ReservationAccessGateModalProps {
  isOpen: boolean;
  reason: GateReason;
  onClose: () => void;
}

export function ReservationAccessGateModal({
  isOpen,
  reason,
  onClose,
}: ReservationAccessGateModalProps) {
  const router = useRouter();

  const content =
    reason === "LOGIN_REQUIRED"
      ? {
          title: "로그인이 필요합니다",
          message: "예약 기능은 로그인 후 이용할 수 있어요. 회원가입 후 바로 예약을 진행해보세요.",
          primary: { label: "회원가입", href: "/register" },
          secondary: { label: "로그인", href: "/login" },
        }
      : {
          title: "입주자 전용 기능입니다",
          message: "공용시설 예약은 입주자(RESIDENT)만 이용할 수 있어요. 방을 둘러보고 입주 신청을 진행해보세요.",
          primary: { label: "방 알아보러 가기", href: "/rooms" },
          secondary: { label: "입주 신청", href: "/contract-apply" },
        };

  const handleGo = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/35 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="relative w-full max-w-md rounded-[2rem] border border-border bg-background p-6 shadow-2xl md:p-8"
          >
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground">
                Reservation Access
              </p>
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                {content.title}
              </h3>
              <p className="rounded-[1.5rem] border border-border bg-muted/15 px-5 py-4 text-sm font-medium leading-6 text-foreground/80">
                {content.message}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleGo(content.secondary.href)}
                className="w-full rounded-xl border border-border bg-muted/10 px-5 py-3 text-sm font-black tracking-tight text-foreground transition hover:bg-muted/20"
              >
                {content.secondary.label}
              </button>
              <button
                type="button"
                onClick={() => handleGo(content.primary.href)}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-black tracking-tight text-primary-foreground transition hover:opacity-90"
              >
                {content.primary.label}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

