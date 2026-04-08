import { cn } from "@/lib/utils";
import type { MyReservationItem } from "../_types";

const statusMeta: Record<
  MyReservationItem["status"],
  { label: string; className: string }
> = {
  PENDING: {
    label: "승인 대기",
    className: "border-accent/30 bg-accent/10 text-accent",
  },
  APPROVED: {
    label: "예약 확정",
    className: "border-primary/15 bg-primary text-background",
  },
  CANCELLED: {
    label: "취소됨",
    className: "border-secondary/40 bg-secondary/15 text-muted",
  },
  COMPLETED: {
    label: "이용 완료",
    className: "border-primary/10 bg-primary/10 text-primary",
  },
};

export function ReservationStatusBadge({
  status,
}: {
  status: MyReservationItem["status"];
}) {
  const meta = statusMeta[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.24em] uppercase",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
