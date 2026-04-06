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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS: {
  label: string;
  items: { href: string; label: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Overview",
    items: [{ href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/spaces", label: "공간 관리", icon: Building2 },
      { href: "/admin/contracts", label: "계약", icon: FileText },
      { href: "/admin/devices", label: "기기", icon: Cpu },
      { href: "/admin/reservations", label: "예약", icon: CalendarDays },
      { href: "/admin/billing", label: "결제·청구", icon: CreditCard },
      { href: "/admin/voc", label: "민원", icon: MessageSquareText },
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
    <nav className="flex h-full flex-col gap-8 px-4 py-6" aria-label="관리자 메뉴">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="mb-3 px-3 font-black text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = linkActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-black uppercase tracking-wider transition-colors",
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
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
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-primary/20 backdrop-blur-sm lg:hidden"
          aria-label="메뉴 닫기"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-border bg-background shadow-lg transition-transform duration-300 lg:static lg:z-0 lg:max-h-none lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
          <span className="font-black text-xs uppercase tracking-widest text-primary">메뉴</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground hover:bg-muted"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto lg:max-h-none lg:flex-1">{nav}</div>
      </aside>
    </>
  );
}
