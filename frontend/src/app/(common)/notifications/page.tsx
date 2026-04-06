import Link from "next/link";
import { Bell } from "lucide-react";
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
    error = "로그인이 필요합니다.";
  } else if (!res.ok) {
    error = "알림을 불러오지 못했습니다.";
  } else {
    const body = (await res.json()) as ApiResponse<NotificationListData>;
    if (body.success && body.data) list = body.data;
    else error = body.message ?? "알림을 불러오지 못했습니다.";
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">My</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">알림</h1>
        </div>
        <Link href="/profile" className="text-sm font-black uppercase tracking-wider text-secondary hover:underline">
          프로필
        </Link>
      </header>

      {error && (
        <div
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {list && (
        <ul className="space-y-3">
          {list.content.length === 0 ? (
            <li className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/25 px-6 py-16 text-center">
              <Bell className="size-10 text-muted-foreground" strokeWidth={1.25} aria-hidden />
              <p className="font-medium tracking-tight text-muted-foreground">표시할 알림이 없습니다.</p>
            </li>
          ) : (
            list.content.map((item) => (
              <li
                key={item.notificationId}
                className={`rounded-xl border px-4 py-4 ${item.isRead ? "border-border bg-background" : "border-secondary/40 bg-secondary/10"}`}
              >
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  {item.type ?? "NOTICE"}
                </p>
                <p className="mt-1 font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-foreground/80">{item.message}</p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
