"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [isRead, setIsRead] = useState(item.isRead);

  const handleClick = async () => {
    console.log("Notification Clicked:", item);

    // 1. 읽음 처리 (비동기로 진행하되 페이지 이동을 막지 않음)
    if (!isRead) {
      fetch(`/api/notifications/${item.notificationId}/read`, { method: "PATCH" })
        .then(res => {
          if (res.ok) setIsRead(true);
          else console.warn("Read status update failed", res.status);
        })
        .catch(err => console.error("Read status error", err));
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
        // 민원 생성 알림만 관리자 페이지로, 나머지는 마이페이지 민원 상세로
        if (type === "VOC_CREATED") {
          targetPath = `/admin/vocs/${refId}`;
        } else {
          targetPath = `/profile/vocs/${refId}`;
        }
      }
    }

    console.log("Redirecting to:", targetPath);
    router.push(targetPath);
  };

  return (
    <li
      onClick={handleClick}
      className={`group bg-white rounded-[2.5rem] p-10 md:p-14 border transition-all relative overflow-hidden cursor-pointer active:scale-[0.98] ${
        isRead 
        ? "border-primary/5 opacity-60 grayscale-[0.3]" 
        : "border-accent/20 shadow-2xl shadow-accent/5 hover:border-accent/40"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
              MSG-00{item.notificationId}
            </span>
            <span
              className={`text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full ${
                isRead ? "bg-muted/10 text-muted-foreground" : "bg-accent/10 text-accent"
              }`}
            >
              {item.type ?? "NOTICE"}
            </span>
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter leading-tight uppercase italic group-hover:text-accent transition-colors">
              {item.title}
            </h2>
            <p className="mt-4 text-lg font-medium tracking-tight text-primary opacity-60">
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
      
      {/* Visual Indicator for Read Status Change */}
      {!isRead && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-all" />
      )}
    </li>
  );
}
