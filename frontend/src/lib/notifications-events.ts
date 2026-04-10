/** 알림 배지 등에서 미읽음 개수를 다시 불러오도록 신호를 보냅니다. */
export const NOTIFICATIONS_UNREAD_INVALIDATE = "cokkiri:notifications-unread-invalidate";

export function invalidateNotificationsUnreadCount(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UNREAD_INVALIDATE));
}
