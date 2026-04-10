"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 알림 페이지 RSC 캐시 보정 (재진입·탭·bfcache).
 *
 * 읽음 직후 갱신은 NotificationListItem에서 router.refresh() 후 이동 전 대기로 처리합니다.
 * 여기서 invalidate에 묶인 지연 refresh는 이미 다른 라우트로 나간 뒤에는 "현재 URL"만 갱신되어
 * 대시보드·목록이 영원히 옛날 데이터로 남는 버그가 됩니다.
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

    scheduleRefresh(450);

    const onInvalidate = () => {
      scheduleRefresh(100);
    };

    const NOTIFICATIONS_UNREAD_INVALIDATE = "cokkiri:notifications-unread-invalidate";
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
