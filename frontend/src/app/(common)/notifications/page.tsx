import Link from "next/link";
import { Bell } from "lucide-react";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { PaginationBar } from "@/app/(common)/community/_components/PaginationBar";
import { bffGet } from "./_api/bff-server";

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
  title: "알림 | CoKkiri",
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
    // 일부 환경에서 notifications 조회가 403으로 오탐되는 케이스가 있어
    // 실제 로그인 여부를 /users/me로 재확인 후 안내 메시지를 결정한다.
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-6 pb-24 pt-20 md:px-12 md:pt-24 md:pb-32 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <header className="border-b border-primary/10 pb-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-5">
                <p className="font-black text-[10px] uppercase tracking-[0.35em] text-accent">MY / NOTIFICATIONS</p>
                <h1 className="text-balance text-[11vw] font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-[9vw] md:text-[6vw] lg:text-[4.25rem]">
                  알림
                  <span className="underline decoration-secondary decoration-2 underline-offset-[0.18em]"> 센터</span>
                </h1>
                <p className="max-w-xl font-medium tracking-tight text-foreground/80 md:text-lg">
                  서비스 상태 변동과 주요 이벤트를 시간순으로 확인할 수 있습니다.
                </p>
              </div>
              <Link
                href="/profile"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-xs font-black uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-accent"
              >
                프로필 이동
              </Link>
            </div>
          </header>

          <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            <article className="rounded-[2rem] border border-primary/10 bg-primary/5 px-7 py-7">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">TOTAL</p>
              <p className="mt-3 text-5xl font-black tracking-tight text-foreground">{String(totalCount).padStart(2, "0")}</p>
            </article>
            <article className="rounded-[2rem] border border-secondary/30 bg-secondary/10 px-7 py-7">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">UNREAD IN PAGE</p>
              <p className="mt-3 text-5xl font-black tracking-tight text-foreground">{String(unreadCount).padStart(2, "0")}</p>
            </article>
          </section>

          <section className="mt-10 flex flex-wrap items-center gap-3 border-y border-primary/10 py-5">
            <Link
              href="/notifications"
              className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.24em] transition-colors ${!isRead ? "bg-primary text-primary-foreground" : "border border-border text-foreground/70 hover:text-foreground"}`}
            >
              전체
            </Link>
            <Link
              href="/notifications?is_read=false"
              className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.24em] transition-colors ${isRead === "false" ? "bg-primary text-primary-foreground" : "border border-border text-foreground/70 hover:text-foreground"}`}
            >
              읽지 않음
            </Link>
            <Link
              href="/notifications?is_read=true"
              className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.24em] transition-colors ${isRead === "true" ? "bg-primary text-primary-foreground" : "border border-border text-foreground/70 hover:text-foreground"}`}
            >
              읽음
            </Link>
          </section>

          {error && (
            <>
              {error === LOGIN_REQUIRED_MESSAGE ? <LoginRequiredGate /> : null}
              <div
                className="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
                role="alert"
              >
                <p>{error}</p>
                {error === LOGIN_REQUIRED_MESSAGE ? (
                  <p className="mt-2 text-sm">
                    <Link href="/login" className="font-black text-secondary underline underline-offset-4">
                      로그인 페이지로 이동
                    </Link>
                  </p>
                ) : null}
              </div>
            </>
          )}

          {list && (
            <>
              <ul className="mt-8 space-y-5">
                {list.content.length === 0 ? (
                  <li className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-border bg-muted/25 px-6 py-16 text-center">
                    <Bell className="size-10 text-muted-foreground" strokeWidth={1.25} aria-hidden />
                    <p className="font-medium tracking-tight text-muted-foreground">표시할 알림이 없습니다.</p>
                  </li>
                ) : (
                  list.content.map((item) => (
                    <li
                      key={item.notificationId}
                      className={`rounded-[2rem] border px-7 py-6 shadow-2xl shadow-primary/5 ${item.isRead ? "border-primary/10 bg-background" : "border-secondary/30 bg-secondary/10"}`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                        {item.type ?? "NOTICE"}
                      </p>
                      <p className="mt-2 text-xl font-black tracking-tight text-foreground md:text-2xl">{item.title}</p>
                      <p className="mt-2 text-sm font-medium tracking-tight text-foreground/80 md:text-base">{item.message}</p>
                    </li>
                  ))
                )}
              </ul>
              <PaginationBar
                page={list.page}
                totalPages={list.totalPages}
                baseQuery={baseQuery}
                pageSize={size}
                hrefBase="/notifications"
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
