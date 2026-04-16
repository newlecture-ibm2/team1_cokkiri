'use client';

import { Loader2, TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminReservationItem } from '../_types';

interface ReservationActionModalProps {
  action: 'approve' | 'cancel';
  reservation: AdminReservationItem;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const actionMeta = {
  approve: {
    title: '예약 승인',
    description: '이 예약을 승인 처리하시겠습니까?',
    confirmLabel: '승인하기',
    confirmVariant: 'default' as const,
  },
  cancel: {
    title: '예약 취소',
    description: '이 예약을 관리자 권한으로 취소 처리하시겠습니까?',
    confirmLabel: '취소 처리',
    confirmVariant: 'destructive' as const,
  },
};

export function ReservationActionModal({
  action,
  reservation,
  isSubmitting,
  onClose,
  onConfirm,
}: ReservationActionModalProps) {
  const meta = actionMeta[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="border-primary/5 bg-white relative z-10 w-full max-w-lg rounded-[2rem] border p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/8 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
              <TriangleAlert className="size-5" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-[10px] font-black tracking-[0.32em] uppercase">
                Confirm Action
              </p>
              <h2 className="text-primary text-2xl font-black tracking-tighter">{meta.title}</h2>
              <p className="text-muted-foreground text-sm leading-6 font-medium">
                {meta.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:bg-primary/[0.03] hover:text-primary rounded-full p-2 transition"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="border-primary/10 bg-primary/[0.03] mt-6 rounded-[1.5rem] border p-5">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground font-semibold">예약 ID</span>
              <span className="text-primary font-black">#{reservation.id}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground font-semibold">신청자</span>
              <span className="text-primary font-black">{reservation.userName}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground font-semibold">시설</span>
              <span className="text-primary font-black">{reservation.spaceName}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground font-semibold">예약 일정</span>
              <span className="text-foreground text-right font-black">
                {reservation.reservationDate} {reservation.startTime.slice(0, 5)} -{' '}
                {reservation.endTime.slice(0, 5)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            닫기
          </Button>
          <Button variant={meta.confirmVariant} onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {meta.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
