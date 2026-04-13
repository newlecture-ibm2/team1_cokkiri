import Link from "next/link";
import { cn } from "@/lib/utils";

const NOTIFICATION_CATEGORIES = [
  { value: "NOTICE", label: "공지사항" },
  { value: "COMMENT", label: "댓글" },
  { value: "CONTRACT", label: "계약" },
  { value: "RESERVATION", label: "예약" },
  { value: "PAYMENT", label: "결제" },
  { value: "VOC", label: "민원" },
] as const;

type Props = {
  active?: string;
  /** 현재 is_read 값을 유지하기 위한 파라미터 */
  currentIsRead?: string;
};

export function NotificationCategoryFilter({ active, currentIsRead }: Props) {
  const base =
    "shrink-0 text-[clamp(0.75rem,1.4vw,1.125rem)] font-bold tracking-[0.2em] transition-all whitespace-nowrap pb-2 border-b-2 border-transparent";

  function buildHref(type?: string) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (currentIsRead) params.set("is_read", currentIsRead);
    const qs = params.toString();
    return `/notifications${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex items-center gap-[clamp(1rem,3vw,2.5rem)] overflow-x-auto">
      <Link
        href={buildHref()}
        className={cn(
          base,
          !active
            ? "text-accent border-accent"
            : "text-primary/90 hover:text-primary",
        )}
      >
        전체
      </Link>
      {NOTIFICATION_CATEGORIES.map((c) => (
        <Link
          key={c.value}
          href={buildHref(c.value)}
          className={cn(
            base,
            active === c.value
              ? "text-accent border-accent"
              : "text-primary/90 hover:text-primary",
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
