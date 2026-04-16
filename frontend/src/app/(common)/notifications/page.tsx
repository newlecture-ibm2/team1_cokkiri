import Link from "next/link";
import { Bell, FileText, ArrowRight } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";
import { bffGet } from "./_api/bff-server";
import { NotificationListItem } from "./_components/NotificationListItem";
import { NotificationsInboxRefreshClient } from "./_components/NotificationsInboxRefreshClient";
import { NotificationCategoryFilter } from "./_components/NotificationCategoryFilter";
import { NotificationSearchAndSort } from "./_components/NotificationSearchAndSort";

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

type SearchParams = Promise<{ p?: string; s?: string; is_read?: string; type?: string; q?: string }>;

export const metadata = {
  title: "알림 센터 | CoKkiri",
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.p ?? "0", 10) || 0);
  const size = Math.min(50, Math.max(1, parseInt(sp.s ?? "20", 10) || 20));
  const isRead = sp.is_read === "true" ? "true" : sp.is_read === "false" ? "false" : "";
  const type = sp.type ?? "";
  const query = sp.q ?? "";

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

  // Client-side filtering by type and search query
  let filteredContent = list?.content ?? [];
  if (type) {
    filteredContent = filteredContent.filter((item) => {
      const ref = item.referenceType?.toUpperCase() ?? "";
      const t = item.type?.toUpperCase() ?? "";
      const typeUpper = type.toUpperCase();
      if (typeUpper === "NOTICE") return t.includes("NOTICE") || ref === "COMMUNITY";
      if (typeUpper === "COMMENT") return t.includes("COMMENT");
      if (typeUpper === "CONTRACT") return ref === "CONTRACT";
      if (typeUpper === "RESERVATION") return ref === "RESERVATION";
      if (typeUpper === "PAYMENT") return ref === "PAYMENT";
      if (typeUpper === "VOC") return ref === "VOC";
      return true;
    });
  }
  if (query) {
    const q = query.toLowerCase();
    filteredContent = filteredContent.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q),
    );
  }

  // Build baseQuery for pagination
  const baseQueryParts: string[] = [];
  if (isRead) baseQueryParts.push(`is_read=${isRead}`);
  if (type) baseQueryParts.push(`type=${type}`);
  if (query) baseQueryParts.push(`q=${encodeURIComponent(query)}`);
  const baseQuery = baseQueryParts.join("&");

  const totalCount = list?.totalElements ?? 0;
  const unreadCount = list ? list.content.filter((item) => !item.isRead).length : 0;

  return (
    <>
      <NotificationsInboxRefreshClient />
      <div className="mx-auto max-w-5xl">
      {/* Editorial Header */}
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">

          <div className="flex items-end justify-between gap-4 border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0">
              <h1 className="text-[clamp(2.25rem,7vw,5.5rem)] font-black leading-none tracking-tight uppercase whitespace-nowrap">
                NOTIFICATIO<span className="underline underline-offset-4 decoration-[var(--color-accent)]">N.</span>
                <span className="text-[clamp(1rem,3vw,2.5rem)] font-bold tracking-normal ml-3 align-baseline opacity-80">알림</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.5vw,2rem)] mb-[clamp(2rem,5vw,5rem)]">
        {[
          {
            label: "TOTAL",
            value: totalCount.toString().padStart(2, "0"),
            icon: FileText,
            watermark: "TOTAL",
          },
          {
            label: "UNREAD",
            value: unreadCount.toString().padStart(2, "0"),
            icon: Bell,
            watermark: "NEW",
          },
        ].map((stat, i) => (
          <div key={i} className="group relative p-[clamp(1.5rem,3vw,2.5rem)] bg-primary/5 border border-primary/10 rounded-[clamp(1rem,2vw,2rem)] overflow-hidden transition-all hover:bg-primary/10 whitespace-nowrap">
            <div className="relative z-10">
              <stat.icon className="w-[clamp(1.25rem,2vw,2rem)] h-[clamp(1.25rem,2vw,2rem)] text-accent mb-[clamp(1rem,2vw,2rem)]" />
              <span className="block text-[clamp(0.6rem,0.9vw,0.75rem)] font-black tracking-[0.3em] uppercase text-primary/80 mb-2">
                {stat.label}
              </span>
              <div className="flex items-end justify-between">
                <h3 className="text-[clamp(2rem,5vw,3.75rem)] font-black tracking-tighter leading-none text-primary">
                  {stat.value}
                </h3>
              </div>
            </div>
            <span className="absolute -right-4 -bottom-6 text-[clamp(4rem,10vw,8rem)] font-black opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.06] transition-opacity leading-none">
              {stat.watermark}
            </span>
          </div>
        ))}
      </div>

      {/* Filter & List Area */}
      <div className="space-y-[clamp(1.5rem,3vw,3rem)]">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-foreground/10 pb-[clamp(1rem,2vw,2rem)]">
          <div className="flex flex-col gap-4">
            <NotificationCategoryFilter active={type || undefined} currentIsRead={isRead || undefined} />
          </div>
          <NotificationSearchAndSort />
        </section>

        {error && (
          <div className="rounded-[2rem] bg-destructive/5 border border-destructive/10 p-10 text-center">
            <p className="text-destructive font-black uppercase tracking-widest text-sm mb-4">Error Detected</p>
            <p className="text-2xl font-bold tracking-tight text-primary underline decoration-destructive/30 underline-offset-8">
              {error}
            </p>
            {error === LOGIN_REQUIRED_MESSAGE && (
              <div className="mt-8 flex justify-center">
                <LoginRequiredGate />
                <Link href="/login" className="mt-8 inline-flex h-12 bg-primary text-white px-8 rounded-xl items-center gap-2 text-sm font-black uppercase tracking-[0.2em] hover:bg-accent transition-all animate-pulse">
                  Go to Login <ArrowRight className="size-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        {list && (
          <div className="space-y-[clamp(1.5rem,3vw,3rem)]">
            <ul className="grid grid-cols-1 gap-[clamp(1rem,2vw,2rem)]">
              {filteredContent.length === 0 ? (
                <li className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-primary/10 bg-primary/2 px-6 py-32 text-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/5 flex items-center justify-center text-primary/50">
                    <Bell className="size-8" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold tracking-tight text-primary">도착한 알림이 없습니다</p>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/80">
                      You&apos;re all caught up!
                    </p>
                  </div>
                </li>
              ) : (
                filteredContent.map((item) => (
                  <NotificationListItem key={item.notificationId} item={item} />
                ))
              )}
            </ul>
            <div className="pt-[clamp(1rem,2.5vw,2.5rem)] border-t border-primary/5 flex justify-center">
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
      </div>
      </div>
    </>
  );

}
