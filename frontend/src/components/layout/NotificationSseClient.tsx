"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { NOTIFICATIONS_UNREAD_INVALIDATE } from "@/lib/notifications-events";

type NotificationEventPayload = {
  notificationId: number;
  type: string | null;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationToast = {
  id: number;
  title: string;
  message: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
};

type NotificationListData = {
  totalElements: number;
};

export default function NotificationSseClient() {
  const { isLoggedIn, isLoading } = useAuthStore();
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const hasUnread = unreadCount > 0;
  const unreadLabel = useMemo(() => (unreadCount > 99 ? "99+" : String(unreadCount)), [unreadCount]);

  useEffect(() => {
    if (isLoading || !isLoggedIn) {
      setToasts([]);
      setUnreadCount(0);
      return;
    }

    let mounted = true;
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications?is_read=false&p=0&s=1&sort=createdAt,desc", {
          credentials: "include",
        });
        if (!res.ok) return;
        const body = (await res.json()) as ApiResponse<NotificationListData>;
        if (!mounted || !body.success || !body.data) return;
        setUnreadCount(body.data.totalElements ?? 0);
      } catch {
        // Ignore: the realtime stream still works even if initial unread count fetch fails.
      }
    };

    void fetchUnreadCount();
    const unreadResyncTimer = window.setInterval(() => {
      void fetchUnreadCount();
    }, 60000);

    const onUnreadInvalidate = () => {
      void fetchUnreadCount();
    };
    window.addEventListener(NOTIFICATIONS_UNREAD_INVALIDATE, onUnreadInvalidate);

    const eventSource = new EventSource("/api/notifications/stream", { withCredentials: true });

    eventSource.onopen = () => {
      console.log("[SSE] Connection established.");
    };

    eventSource.onerror = (err) => {
      console.error("[SSE] Connection error or closed. EventSource will retry automatically.", err);
    };

    const onNotification = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as NotificationEventPayload;
        if (!mounted) return;

        // 실시간 알림 센터 동기화를 위해 전역 시그널 발행
        import("@/lib/notifications-events").then((m) => m.invalidateNotificationsUnreadCount());

        setUnreadCount((prev) => prev + (payload.isRead ? 0 : 1));
        setToasts((prev) => {
          const next = [{ id: payload.notificationId, title: payload.title, message: payload.message }, ...prev];
          return next.slice(0, 3);
        });

        window.setTimeout(() => {
          if (!mounted) return;
          setToasts((prev) => prev.filter((t) => t.id !== payload.notificationId));
        }, 4500);
      } catch (e) {
        console.warn("[SSE] Failed to parse notification payload:", e);
      }
    };

    const onConnected = () => {
      void fetchUnreadCount();
    };
    eventSource.addEventListener("notification", onNotification as EventListener);
    eventSource.addEventListener("connected", onConnected as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener(NOTIFICATIONS_UNREAD_INVALIDATE, onUnreadInvalidate);
      window.clearInterval(unreadResyncTimer);
      eventSource.removeEventListener("notification", onNotification as EventListener);
      eventSource.removeEventListener("connected", onConnected as EventListener);
      eventSource.close();
    };
  }, [isLoggedIn, isLoading]);

  if (!isLoggedIn) return null;

  return (
    <>
      <div className="pointer-events-none fixed top-20 right-4 z-[150] flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-xl border border-secondary/30 bg-background/95 px-4 py-3 shadow-lg backdrop-blur"
            role="status"
            aria-live="polite"
          >
            <p className="text-xs font-black uppercase tracking-wider text-secondary">New Notification</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{toast.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{toast.message}</p>
          </div>
        ))}
      </div>

      <Link
        href="/notifications"
        className="fixed right-5 bottom-5 z-[140] inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-background/95 px-4 py-2 text-sm font-black tracking-wide text-foreground shadow-md backdrop-blur hover:bg-background"
      >
        <span className="relative inline-flex">
          <Bell className="size-4" />
          {hasUnread ? (
            <span className="absolute -top-2 -right-2 inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] leading-5 text-white">
              {unreadLabel}
            </span>
          ) : null}
        </span>
        알림
      </Link>
    </>
  );
}
