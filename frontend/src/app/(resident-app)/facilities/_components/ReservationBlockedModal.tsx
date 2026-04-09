"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ReservationBlockedModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function ReservationBlockedModal({
  isOpen,
  title = "예약 불가 안내",
  message,
  onClose,
}: ReservationBlockedModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-6">
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
            className="relative w-full max-w-md rounded-[2rem] border border-red-200 bg-background p-6 shadow-2xl md:p-8"
          >
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-500">
                Reservation Alert
              </p>
              <h3 className="text-2xl font-black tracking-tight text-primary">{title}</h3>
              <p className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium leading-6 text-red-700">
                {message}
              </p>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-black tracking-tight text-primary-foreground transition hover:opacity-90"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
