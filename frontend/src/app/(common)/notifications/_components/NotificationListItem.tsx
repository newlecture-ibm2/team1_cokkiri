"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { invalidateNotificationsUnreadCount } from "@/lib/notifications-events";

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

export function NotificationListItem({ item }: { item: NotificationItem }) {
  const router = useRouter();
  /** 서버가 잠깐 늦게 따라올 때 로컬 읽음을 덮어쓰지 않도록 낙관적 플래그만 사용 */
  const [readLocally, setReadLocally] = useState(false);

  useEffect(() => {
    setReadLocally(false);
  }, [item.notificationId]);

  const isRead = readLocally || item.isRead;

  const handleClick = async () => {
    // 1. 읽음 처리 후 배지·인박스 갱신 신호 (이동 전에 완료)
    if (!isRead) {
      try {
        const res = await fetch(`/api/notifications/${item.notificationId}/read`, {
          method: "PATCH",
          credentials: "include",
        });
        if (res.ok) {
          setReadLocally(true);
          invalidateNotificationsUnreadCount();
        }
      } catch {
        /* ignore */
      }
    }

    // 2. 경로 설정로직 최적화 (대소문자 무관하게 체크)
    let targetPath = "/notifications";
    const refType = item.referenceType?.toUpperCase();
    const type = item.type?.toUpperCase();
    const refId = item.referenceId;

    if (refId) {
      if (refType === "COMMUNITY") {
        targetPath = `/community/${refId}`;
      } else if (refType === "VOC") {
        if (type === "VOC_CREATED") {
          targetPath = `/admin/vocs/${refId}`;
        } else {
          targetPath = `/profile/vocs/${refId}`;
        }
      } else if (refType === "CONTRACT") {
        targetPath = `/my-contracts`; 
      } else if (refType === "RESERVATION") {
        targetPath = `/my-history/reservation`;
      } else if (refType === "PAYMENT") {
        targetPath = `/my-payments`;
      }
    }

    router.push(targetPath);
  };

  return (
    <li
      onClick={handleClick}
      className={`group rounded-[2.5rem] p-10 md:p-14 border transition-all relative overflow-hidden cursor-pointer active:scale-[0.98] ${
        isRead
          ? "bg-muted/30 border-primary/10"
          : "bg-white border-l-4 border-l-accent border-accent/25 shadow-xl shadow-accent/10 hover:border-accent/45"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
        <div className="space-y-6 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border ${
                isRead
                  ? "border-muted-foreground/25 bg-background text-muted-foreground"
                  : "border-accent/40 bg-accent/15 text-accent"
              }`}
              aria-label={isRead ? "읽은 알림" : "읽지 않은 알림"}
            >
              {isRead ? "읽음" : "미읽음"}
            </span>
            <span
              className={`text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full ${
                isRead ? "bg-muted/20 text-muted-foreground" : "bg-primary/5 text-primary"
              }`}
            >
              {item.type ?? "NOTICE"}
            </span>
            <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50">
              #{item.notificationId}
            </span>
            {!isRead ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                <span className="size-2 rounded-full bg-accent animate-pulse" aria-hidden />
                확인 필요
              </span>
            ) : null}
          </div>
          <div>
            <h2
              className={`text-3xl font-black tracking-tighter leading-tight uppercase italic transition-colors ${
                isRead ? "text-primary/70" : "text-primary group-hover:text-accent"
              }`}
            >
              {item.title}
            </h2>
            <p
              className={`mt-4 text-lg font-medium tracking-tight ${
                isRead ? "text-muted-foreground" : "text-primary/80"
              }`}
            >
              {item.message}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2 text-right">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-20">
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {!isRead ? (
        <div className="pointer-events-none absolute top-0 right-0 size-40 rounded-full bg-accent/10 -mr-20 -mt-20 blur-3xl group-hover:bg-accent/15 transition-all" />
      ) : null}
    </li>
  );
}
