"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NOTIFICATIONS_UNREAD_INVALIDATE } from "@/lib/notifications-events";

/**
 * - 읽음 PATCH 후: invalidate → 짧게 디바운스 후 RSC 갱신
 * - 다른 라우트에서 알림으로 재진입: 마운트 후 지연 refresh (GET이 PATCH보다 먼저 끝나는 레이스 완화)
 * - 탭 전환 복귀 / bfcache 복원: 동일 디바운스로 한 번만 서버 데이터 재요청
 */
export function NotificationsInboxRefreshClient() {
  const router = useRouter();

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = (delayMs: number) => {
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        idle = undefined;
        router.refresh();
      }, delayMs);
    };

    // 클라이언트 네비게이션으로 알림 페이지에 올 때 캐시된 RSC 보정
    scheduleRefresh(450);

    const onInvalidate = () => scheduleRefresh(250);
    window.addEventListener(NOTIFICATIONS_UNREAD_INVALIDATE, onInvalidate);

    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh(320);
    };
    document.addEventListener("visibilitychange", onVisible);

    const onPageShow = (e: Event) => {
      const pe = e as PageTransitionEvent;
      if (pe.persisted) scheduleRefresh(120);
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      if (idle) clearTimeout(idle);
      window.removeEventListener(NOTIFICATIONS_UNREAD_INVALIDATE, onInvalidate);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return null;
}
