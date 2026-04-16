import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  /** 미처리 큐(OPEN·IN_PROGRESS) */
  pending: boolean;
  /** 전체 목록 */
  all: boolean;
  /** 단일 상태 필터 */
  status: string;
};

const base =
  "shrink-0 rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-transform duration-200 hover:scale-[1.02]";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "OPEN", label: "접수" },
  { value: "IN_PROGRESS", label: "처리 중" },
  { value: "RESOLVED", label: "처리 완료" },
  { value: "CANCELLED", label: "취소" },
];

export function AdminVocStatusFilter({ pending, all, status }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:gap-3">
      <Link
        href="/admin/vocs?pending=true"
        className={cn(
          base,
          pending
            ? "border-secondary bg-primary text-primary-foreground shadow-sm"
            : "border-primary/10 bg-white text-primary/50 hover:border-accent/40",
        )}
      >
        미처리
      </Link>
      <Link
        href="/admin/vocs?all=1"
        className={cn(
          base,
          all
            ? "border-secondary bg-primary text-primary-foreground shadow-sm"
            : "border-primary/10 bg-white text-primary/50 hover:border-accent/40",
        )}
      >
        전체
      </Link>
      {STATUS_TABS.map((t) => {
        const active = !pending && !all && status === t.value;
        return (
          <Link
            key={t.value}
            href={`/admin/vocs?status=${encodeURIComponent(t.value)}`}
            className={cn(
              base,
              active
                ? "border-secondary bg-primary text-primary-foreground shadow-sm"
                : "border-primary/10 bg-white text-primary/50 hover:border-accent/40",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
