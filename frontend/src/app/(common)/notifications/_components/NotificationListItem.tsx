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
    // 1. 이미 읽은 상태가 아니라면 읽음 처리 API 호출
    if (!isRead) {
      try {
        const res = await fetch(`/api/notifications/${item.notificationId}/read`, {
          method: "PATCH",
        });
        if (res.ok) {
          setIsRead(true);
        }
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }

    // 2. 알림 타입 및 참조 아이디에 따른 상세 페이지 이동 경로 설정
    let targetPath = "/notifications"; // 기본값 (상세 페이지가 없을 경우 알림 목록 유지)
    
    if (item.referenceType === "COMMUNITY" && item.referenceId) {
      targetPath = `/community/${item.referenceId}`;
    } else if (item.referenceType === "VOC" && item.referenceId) {
      targetPath = `/my/voc/${item.referenceId}`;
    }

    // 3. 페이지 이동
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
