import Link from "next/link";
import { Bell, FileText, Layout, ArrowRight } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";
import { bffGet } from "./_api/bff-server";
import { MotionEnter } from "@/app/(common)/community/_components/MotionEnter";

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
    <div className="mx-auto w-full max-w-[1400px]">
      <MotionEnter>
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
              { label: "TOTAL MESSAGES", value: totalCount.toString().padStart(2, '0'), icon: FileText, desc: "전체 수신 알림" },
              { label: "UNREAD IN PAGE", value: unreadCount.toString().padStart(2, '0'), icon: Bell, desc: "현재 페이지 미확인" }
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
        <div className="flex items-center gap-10 overflow-x-auto border-b border-primary/10 pb-8 mb-12">
            {[
              { label: "ALL", href: "/notifications", active: !isRead },
              { label: "UNREAD", href: "/notifications?is_read=false", active: isRead === "false" },
              { label: "READ", href: "/notifications?is_read=true", active: isRead === "true" }
            ].map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`shrink-0 pb-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 ${tab.active ? "text-accent border-accent" : "text-muted-foreground opacity-40 hover:opacity-100 border-transparent"}`}
              >
                {tab.label}
              </Link>
            ))}
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
                  <li
                    key={item.notificationId}
                    className={`group bg-white rounded-[2.5rem] p-10 md:p-14 border transition-all relative overflow-hidden ${item.isRead ? "border-primary/5 opacity-60" : "border-accent/20 shadow-2xl shadow-accent/5"}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                       <div className="space-y-6 max-w-2xl">
                          <div className="flex items-center gap-4">
                             <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">MSG-00{item.notificationId}</span>
                             <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full ${item.isRead ? "bg-muted/10 text-muted-foreground" : "bg-accent/10 text-accent"}`}>
                                {item.type ?? "NOTICE"}
                             </span>
                          </div>
                          <div>
                            <h2 className="text-3xl font-black tracking-tighter leading-tight uppercase italic">{item.title}</h2>
                            <p className="mt-4 text-lg font-medium tracking-tight text-primary opacity-60">{item.message}</p>
                          </div>
                       </div>
                       <div className="shrink-0 flex flex-col items-end gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-20">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                    </div>
                  </li>
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
      </MotionEnter>
    </div>
  );
}
