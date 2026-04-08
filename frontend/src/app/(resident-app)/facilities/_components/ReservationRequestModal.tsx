"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ReservationRequestModalProps {
  isOpen: boolean;
  facilityName: string;
  startLabel: string;
  endLabel: string;
  durationMinutes: number;
  startIso: string;
  endIso: string;
  onClose: () => void;
  onSubmit: (form: { purpose: string; notes: string }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function ReservationRequestModal({
  isOpen,
  facilityName,
  startLabel,
  endLabel,
  durationMinutes,
  startIso,
  endIso,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ReservationRequestModalProps) {
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPurpose("");
      setNotes("");
      return;
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ purpose, notes });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
            onClick={isSubmitting ? undefined : onClose}
          />

          <motion.form
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            onSubmit={handleSubmit}
            className="relative w-full max-w-lg rounded-[2rem] border border-border bg-background p-6 shadow-2xl md:p-8"
          >
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                Reservation Request
              </p>
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                예약 신청 정보
              </h3>
              <p className="text-sm font-medium tracking-tight text-muted-foreground">
                선택한 슬롯 정보가 자동으로 반영되었습니다. 내용을 확인한 뒤 신청하세요.
              </p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm font-black text-primary">{facilityName}</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {startLabel} - {endLabel}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                이용 시간 {durationMinutes}분
              </p>
              <div className="mt-4 space-y-2 rounded-xl bg-background/80 p-3 text-xs font-medium text-muted-foreground">
                <p>Start ISO: {startIso}</p>
                <p>End ISO: {endIso}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  이용 목적
                </label>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="예: 팀 회의, 개인 운동, 세탁"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  주의사항
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="함께 사용하는 분들을 위해 필요한 메모가 있다면 남겨주세요."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-border bg-muted/20 px-5 py-3 text-sm font-black tracking-tight text-foreground disabled:opacity-50"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-black tracking-tight text-primary-foreground disabled:opacity-50"
              >
                {isSubmitting ? "신청 중..." : "예약 신청하기"}
              </button>
            </div>
          </motion.form>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
