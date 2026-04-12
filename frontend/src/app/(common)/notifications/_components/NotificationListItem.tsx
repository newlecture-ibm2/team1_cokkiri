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
    // 1. 읽음 처리: router.refresh()는 "현재 URL"의 RSC만 갱신합니다.
    //    invalidate만 지연 실행하면 그사이 router.push로 다른 페이지로 나가 알림 페이지는 갱신되지 않습니다.
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
          // Flight/RSC 페이로드가 돌아올 때까지 잠깐 대기 후 이동 (refresh는 Promise를 반환하지 않음)
          await new Promise((r) => setTimeout(r, 400));
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
          targetPath = `/vocs/${refId}`;
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
      className={`group relative rounded-[clamp(1rem,2vw,2rem)] p-[clamp(1.25rem,3vw,2.5rem)] border transition-all overflow-hidden cursor-pointer active:scale-[0.98] ${
        isRead
          ? "bg-primary/3 border-primary/10"
          : "bg-white border-l-4 border-l-accent border-accent/20 shadow-lg shadow-accent/5 hover:border-accent/40"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-[clamp(1rem,2vw,2rem)] relative z-10">
        <div className="space-y-[clamp(0.5rem,1.5vw,1.5rem)] min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[clamp(0.55rem,0.8vw,0.65rem)] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-lg border ${
                isRead
                  ? "border-primary/10 bg-primary/5 text-primary/50"
                  : "border-accent/30 bg-accent/10 text-accent"
              }`}
              aria-label={isRead ? "읽은 알림" : "읽지 않은 알림"}
            >
              {isRead ? "읽음" : "미읽음"}
            </span>
            <span
              className={`text-[clamp(0.55rem,0.8vw,0.65rem)] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-lg ${
                isRead ? "bg-primary/5 text-primary/40" : "bg-primary/5 text-primary/70"
              }`}
            >
              {item.type ?? "NOTICE"}
            </span>
            <span className="text-[clamp(0.5rem,0.7vw,0.6rem)] font-medium tracking-wider text-primary/30">
              #{item.notificationId}
            </span>
            {!isRead ? (
              <span className="inline-flex items-center gap-1.5 text-[clamp(0.5rem,0.7vw,0.6rem)] font-bold tracking-wider text-accent">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" aria-hidden />
                확인 필요
              </span>
            ) : null}
          </div>
          <div>
            <h2
              className={`text-[clamp(1rem,2vw,1.5rem)] font-bold tracking-tight leading-snug transition-colors ${
                isRead ? "text-primary/60" : "text-primary group-hover:text-accent"
              }`}
            >
              {item.title}
            </h2>
            <p
              className={`mt-[clamp(0.25rem,0.5vw,0.5rem)] text-[clamp(0.8rem,1.2vw,1rem)] font-medium tracking-tight ${
                isRead ? "text-primary/40" : "text-primary/70"
              }`}
            >
              {item.message}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1 text-right">
          <span className="text-[clamp(0.55rem,0.8vw,0.65rem)] font-bold tracking-tight text-primary/50">
            {(() => {
              const d = new Date(item.createdAt);
              return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
            })()}
          </span>
          <span className="text-[clamp(0.5rem,0.7vw,0.6rem)] font-medium tracking-tight text-primary/30">
            {(() => {
              const d = new Date(item.createdAt);
              return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
            })()}
          </span>
        </div>
      </div>

      {!isRead ? (
        <div className="pointer-events-none absolute top-0 right-0 size-40 rounded-full bg-accent/10 -mr-20 -mt-20 blur-3xl group-hover:bg-accent/15 transition-all" />
      ) : null}
    </li>
  );
}
