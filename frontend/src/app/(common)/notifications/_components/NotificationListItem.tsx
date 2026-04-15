"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { invalidateNotificationsUnreadCount } from "@/lib/notifications-events";
import { useAuthStore } from "@/store/useAuthStore";

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

/** referenceType을 한글 발신 정보로 변환 */
function senderLabel(referenceType: string | null): string {
  switch (referenceType?.toUpperCase()) {
    case "COMMUNITY": return "커뮤니티";
    case "VOC": return "민원";
    case "CONTRACT": return "계약";
    case "RESERVATION": return "예약";
    case "PAYMENT": return "결제";
    default: return "시스템";
  }
}

export function NotificationListItem({ item }: { item: NotificationItem }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [readLocally, setReadLocally] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    setReadLocally(false);
    setDeleted(false);
  }, [item.notificationId]);

  const isRead = readLocally || item.isRead;
  const isAdmin = user?.role === "ADMIN";

  const handleClick = async () => {
    if (!isRead) {
      try {
        const res = await fetch(`/api/notifications/${item.notificationId}/read`, {
          method: "PATCH",
          credentials: "include",
        });
        if (res.ok) {
          setReadLocally(true);
          invalidateNotificationsUnreadCount();
          router.refresh();
          await new Promise((r) => setTimeout(r, 400));
        }
      } catch {
        /* ignore */
      }
    }

    let targetPath = "/notifications";
    const refType = item.referenceType?.toUpperCase();
    const refId = item.referenceId;

    if (refId) {
      if (refType === "COMMUNITY") {
        targetPath = `/community/${refId}`;
      } else if (refType === "VOC") {
        targetPath = isAdmin ? `/admin/vocs/${refId}` : `/vocs/${refId}`;
      } else if (refType === "CONTRACT") {
        targetPath = isAdmin ? `/admin/contracts` : `/my-contracts`;
      } else if (refType === "RESERVATION") {
        targetPath = `/my-history/reservation`;
      } else if (refType === "PAYMENT") {
        targetPath = `/my-payments`;
      }
    }

    router.push(targetPath);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 알림을 삭제할까요?")) return;

    try {
      const res = await fetch(`/api/notifications/${item.notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDeleted(true);
        invalidateNotificationsUnreadCount();
        router.refresh();
      }
    } catch {
      /* ignore */
    }
  };

  /** 날짜 포맷: "2026. 4. 14. 11:30" */
  const formattedDate = (() => {
    const d = new Date(item.createdAt);
    const date = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return `${date} ${time}`;
  })();

  if (deleted) return null;

  return (
    <li
      onClick={handleClick}
      className={`group relative rounded-xl p-5 md:p-6 border transition-all overflow-hidden cursor-pointer active:scale-[0.99] ${
        isRead
          ? "bg-background border-primary/10 hover:bg-primary/3"
          : "bg-white border-primary/15 border-l-4 border-l-accent shadow-sm hover:shadow-md hover:border-primary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="space-y-2 min-w-0">
          {/* 메타 정보: NEW 배지 + 발신 + 번호 */}
          <div className="flex flex-wrap items-center gap-2">
            {!isRead && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-white text-xs font-bold tracking-tight">
                <span className="size-1.5 rounded-full bg-white animate-pulse" aria-hidden />
                NEW
              </span>
            )}
            <span className="text-xs font-semibold tracking-tight text-primary/50">
              {senderLabel(item.referenceType)}
            </span>
            <span className="text-xs font-medium tracking-tight text-primary/30">
              #{item.notificationId}
            </span>
          </div>
          <h2
            className={`text-base md:text-lg font-bold tracking-tight leading-snug transition-colors ${
              isRead ? "text-primary/70" : "text-primary group-hover:text-accent"
            }`}
          >
            {item.title}
          </h2>
          <p
            className={`text-sm font-medium tracking-tight ${
              isRead ? "text-primary/50" : "text-primary/70"
            }`}
          >
            {item.message}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2 pt-1">
          <span className="text-xs font-medium tracking-tight text-primary/40 whitespace-nowrap">
            {formattedDate}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center size-7 rounded-lg text-primary/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="알림 삭제"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
