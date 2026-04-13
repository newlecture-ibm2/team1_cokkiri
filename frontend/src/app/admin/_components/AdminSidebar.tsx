"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Cpu,
  CalendarDays,
  CreditCard,
  MessageSquareText,
  MessagesSquare,
  Activity,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS: {
  label: string;
  items: { href: string; label: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
    ],
  },
  {
    label: "공간·계약",
    items: [
      { href: "/admin/spaces", label: "공간 관리", icon: Building2 },
      { href: "/admin/contracts", label: "계약 관리", icon: FileText },
      { href: "/admin/reservations", label: "예약 관리", icon: CalendarDays },
    ],
  },
  {
    label: "기기·모니터링",
    items: [
      { href: "/admin/devices", label: "기기 관리", icon: Cpu },
      { href: "/admin/monitoring", label: "모니터링", icon: Activity },
    ],
  },
  {
    label: "운영",
    items: [
      { href: "/admin/billing", label: "결제·청구", icon: CreditCard },
      { href: "/admin/vocs", label: "민원 관리", icon: MessageSquareText },
      { href: "/admin/community", label: "커뮤니티", icon: MessagesSquare },
    ],
  },
];

function linkActive(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === "/admin" || pathname === "/admin/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function AdminSidebar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();

  const nav = (
    <nav className="flex h-full flex-col gap-6 px-3 py-5" aria-label="관리자 메뉴">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="mb-2 px-3 text-xs font-black uppercase tracking-[0.25em] text-muted-foreground/80">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = linkActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[15px] font-bold tracking-wide transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                        : "text-foreground/80 hover:bg-primary/5 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 transition-colors",
                        active ? "text-secondary" : "text-foreground/60 group-hover:text-foreground/80",
                      )}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Backdrop */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-primary/15 backdrop-blur-sm lg:hidden"
          aria-label="메뉴 닫기"
          onClick={onClose}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-primary/8 bg-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "lg:static lg:z-0 lg:shrink-0 lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-xl shadow-primary/10" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile close bar */}
        <div className="flex h-14 items-center justify-between border-b border-primary/8 px-4 lg:hidden">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60">
            메뉴
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto lg:max-h-[calc(100dvh-3.5rem)]">
          {nav}
        </div>
      </aside>
    </>
  );
}
