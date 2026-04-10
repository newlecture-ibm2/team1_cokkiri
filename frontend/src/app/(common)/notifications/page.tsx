import Link from "next/link";
import { Bell, FileText, Layout, ArrowRight } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";
import { bffGet } from "./_api/bff-server";
import { MotionEnter } from "@/app/(common)/community/_components/MotionEnter";
import { NotificationListItem } from "./_components/NotificationListItem";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string | null;
  errorCode?: string | null;
};

type NotificationItem = {
  notificationId: number;
  type: string | null;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationListData = {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type SearchParams = Promise<{ p?: string; s?: string; is_read?: string }>;

export const metadata = {
  title: "알림 센터 | CoKkiri",
};

export default async function NotificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));
  const isRead = sp.is_read === "true" ? "true" : sp.is_read === "false" ? "false" : "";

  const qs = new URLSearchParams();
  qs.set("p", String(page));
  qs.set("s", String(size));
  qs.set("sort", "createdAt,desc");
  if (isRead) qs.set("is_read", isRead);

  const res = await bffGet(`notifications?${qs.toString()}`);
  let list: NotificationListData | null = null;
  let error: string | null = null;

  if (res.status === 401) {
    error = LOGIN_REQUIRED_MESSAGE;
  } else if (res.status === 403) {
    const meRes = await bffGet("users/me");
    if (meRes.status === 401 || meRes.status === 403) {
      error = LOGIN_REQUIRED_MESSAGE;
    } else {
      error = "알림을 불러오지 못했습니다.";
    }
  } else if (!res.ok) {
    error = "알림을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<NotificationListData>;
    if (body.success && body.data) list = body.data;
    else error = body.message ?? "알림을 불러오지 못했습니다.";
  }

  const baseQuery = isRead ? `is_read=${isRead}` : "";
  const totalCount = list?.totalElements ?? 0;
  const unreadCount = list ? list.content.filter((item) => !item.isRead).length : 0;

  return (
    <>
      {/* Editorial Header */}
      <header className="mb-20">
        <div className="flex flex-col gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
            INBOX / 01
          </span>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <h1 className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
              NOTIFI<br />CATIONS
            </h1>
            <div className="max-w-md pb-4">
              <p className="text-xl font-medium tracking-tight text-balance border-l-2 border-accent pl-8 opacity-60">
                중요한 일정과 시스템 안내, 그리고 커뮤니티의 소식을 누구보다 빠르게 전달합니다.
              </p>
              <div className="mt-10">
                <Link
                  href="/profile"
                  className="inline-flex h-16 px-10 bg-primary/5 text-primary rounded-2xl items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-primary hover:text-white"
                >
                  Go to Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {[
            {
              label: "TOTAL MESSAGES",
              value: totalCount.toString().padStart(2, "0"),
              icon: FileText,
              desc: "필터 기준 전체 알림 수",
            },
            {
              label: "UNREAD ON PAGE",
              value: unreadCount.toString().padStart(2, "0"),
              icon: Bell,
              desc: "이 페이지에만 표시된 미읽음 (전체 미읽음은 하단 플로팅 배지)",
            },
          ].map((stat, i) => (
            <div key={i} className="group bg-white p-10 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 hover:border-accent/30 transition-all">
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black tracking-widest opacity-20 group-hover:opacity-100 transition-opacity">0{i+1}</span>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">{stat.label}</p>
                <p className="text-5xl font-black tracking-tighter italic">{stat.value}</p>
                <p className="pt-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-40">{stat.desc}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Filters */}
      <div className="mb-12 space-y-4 border-b border-primary/10 pb-8">
        <p className="text-xs font-medium text-muted-foreground">
          카드 왼쪽 강조선·<span className="font-semibold text-accent">미읽음</span> 뱃지가 있는 알림은 아직 확인하지 않은 메시지입니다. 탭을 눌러 목록을 좁힐 수 있습니다.
        </p>
        <div className="flex flex-wrap items-center gap-6 overflow-x-auto">
          {[
            { label: "전체", href: "/notifications", active: !isRead },
            { label: "미읽음만", href: "/notifications?is_read=false", active: isRead === "false" },
            { label: "읽음만", href: "/notifications?is_read=true", active: isRead === "true" },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`shrink-0 pb-2 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                tab.active ? "text-accent border-accent" : "text-muted-foreground opacity-50 hover:opacity-100 border-transparent"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
          <div className="rounded-[2rem] bg-destructive/5 border border-destructive/10 p-10 text-center">
            <p className="text-destructive font-black uppercase tracking-widest text-[10px] mb-4">Error Detected</p>
            <p className="text-xl font-bold tracking-tight text-primary underline decoration-destructive/30 underline-offset-8">
              {error}
            </p>
            {error === LOGIN_REQUIRED_MESSAGE && (
              <div className="mt-8 flex justify-center">
                 <LoginRequiredGate />
                 <Link href="/login" className="inline-flex h-12 bg-primary text-white px-8 rounded-xl items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all animate-pulse ml-4">
                   Go to Login <ArrowRight className="size-3" />
                 </Link>
              </div>
            )}
          </div>
      )}

      {list && (
        <div className="space-y-12">
          <ul className="grid grid-cols-1 gap-8">
            {list.content.length === 0 ? (
              <li className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-32 text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/5 flex items-center justify-center text-primary/20">
                  <Bell className="size-8" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold tracking-tight text-primary">도착한 알림이 없습니다</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    You're all caught up!
                  </p>
                </div>
              </li>
            ) : (
              list.content.map((item) => (
                <NotificationListItem key={item.notificationId} item={item} />
              ))
            )}
          </ul>
          <div className="pt-10 flex justify-center">
            <PaginationBar
              page={list.page}
              totalPages={list.totalPages}
              baseQuery={baseQuery}
              pageSize={size}
              hrefBase="/notifications"
            />
          </div>
        </div>
      )}
    </>
  );

}
