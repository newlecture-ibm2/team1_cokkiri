import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Cpu,
  Activity,
  CalendarDays,
  CreditCard,
  MessageSquareText,
  MessagesSquare,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "홈",
};

const shortcuts: { href: string; label: string; description: string; icon: typeof LayoutDashboard }[] = [
  {
    href: "/admin/dashboard",
    label: "대시보드",
    description: "운영 지표·요약",
    icon: LayoutDashboard,
  },
  { href: "/admin/spaces", label: "공간 관리", description: "호실·공용 공간", icon: Building2 },
  { href: "/admin/contracts", label: "계약", description: "신청·체결·만료", icon: FileText },
  { href: "/admin/reservations", label: "예약", description: "공용 시설 예약", icon: CalendarDays },
  { href: "/admin/devices", label: "기기", description: "IoT 등록·제어", icon: Cpu },
  { href: "/admin/monitoring", label: "기기 모니터링", description: "상태·이력·통계", icon: Activity },
  { href: "/admin/billing", label: "결제·청구", description: "청구·승인", icon: CreditCard },
  { href: "/admin/vocs", label: "민원", description: "전체 민원·답변", icon: MessageSquareText },
  { href: "/admin/community", label: "커뮤니티", description: "게시글·댓글 운영", icon: MessagesSquare },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">CoKkiri Admin</p>
        <h1 className="text-balance text-4xl font-black uppercase tracking-tighter text-foreground md:text-5xl">
          관리자{" "}
          <span className="underline decoration-secondary decoration-2 underline-offset-[0.15em]">홈</span>
        </h1>
        <p className="max-w-2xl text-lg font-medium tracking-tight text-foreground/80">
          왼쪽 메뉴 또는 아래 바로가기에서 업무 영역으로 이동하세요.
        </p>
      </header>

      <section>
        <h2 className="mb-6 font-black text-[14px] uppercase tracking-[0.3em] text-muted-foreground"></h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-[1.5rem] border border-border bg-white p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:border-secondary/50 hover:shadow-sm md:p-8"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Icon className="size-6 shrink-0 text-secondary" strokeWidth={1.5} aria-hidden />
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-secondary" />
                  </div>
                  <h3 className="mt-4 font-black text-lg tracking-tight text-foreground">{item.label}</h3>
                  <p className="mt-2 text-sm font-medium tracking-tight text-muted-foreground">{item.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
