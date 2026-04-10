"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NOTIFICATIONS_UNREAD_INVALIDATE } from "@/lib/notifications-events";

/**
 * 알림 인박스는 서버 컴포넌트로 그려집니다. 클라이언트 이동 후 복귀 시 RSC 페이로드가
 * 오래된 상태로 남을 수 있어, 마운트·읽음 처리 시점에 서버 데이터를 다시 받아옵니다.
 */
export function NotificationsInboxRefreshClient() {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const onInvalidate = () => {
      router.refresh();
    };
    window.addEventListener(NOTIFICATIONS_UNREAD_INVALIDATE, onInvalidate);
    return () => window.removeEventListener(NOTIFICATIONS_UNREAD_INVALIDATE, onInvalidate);
  }, [router]);

  return null;
}
