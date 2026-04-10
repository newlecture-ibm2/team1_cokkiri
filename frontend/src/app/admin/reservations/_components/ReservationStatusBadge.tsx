'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AdminReservationStatus } from '../_types';

const statusMeta: Record<AdminReservationStatus, { label: string; className: string }> = {
  PENDING: {
    label: '승인 대기',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  APPROVED: {
    label: '예약 확정',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  CANCELLED: {
    label: '취소됨',
    className: 'border-slate-200 bg-slate-100 text-slate-600',
  },
  COMPLETED: {
    label: '이용 완료',
    className: 'border-primary/10 bg-primary/10 text-primary',
  },
};

export function ReservationStatusBadge({ status }: { status: AdminReservationStatus }) {
  const meta = statusMeta[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-3 py-1 text-[10px] font-black tracking-[0.24em] uppercase',
        meta.className,
      )}
    >
      {meta.label}
    </Badge>
  );
}
