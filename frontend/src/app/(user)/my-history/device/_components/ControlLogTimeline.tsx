"use client";

import { motion } from "framer-motion";
import type { ControlLogItem } from "../_types";

const DEVICE_ICONS: Record<string, string> = {
  DOOR_LOCK: "🔒",
  LIGHT: "💡",
  AIR_CONDITIONER: "❄️",
  WASHER: "🫧",
  DRYER: "🌀",
  HEATER: "🔥",
  CCTV: "📹",
};

const COMMAND_LABELS: Record<string, string> = {
  ON: "전원 켜기",
  OFF: "전원 끄기",
  LOCK: "잠금",
  UNLOCK: "잠금 해제",
  START: "시작",
  STOP: "정지",
  SET_TEMP: "온도 설정",
  SET_BRIGHTNESS: "밝기 설정",
  SET_MODE: "모드 변경",
};

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  return { date, time };
}

function formatParams(params: string | null): string | null {
  if (!params) return null;
  try {
    const obj = JSON.parse(params);
    const parts: string[] = [];
    if (obj.temperature !== undefined) parts.push(`${obj.temperature}°C`);
    if (obj.brightness !== undefined) parts.push(`밝기 ${obj.brightness}%`);
    if (obj.mode !== undefined) parts.push(`모드: ${obj.mode}`);
    if (obj.course !== undefined) parts.push(`코스: ${obj.course}`);
    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

interface ControlLogTimelineProps {
  logs: ControlLogItem[];
  isLoading: boolean;
}

export default function ControlLogTimeline({ logs, isLoading }: ControlLogTimelineProps) {
  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-4 p-4 rounded-2xl bg-[var(--secondary)]/20">
            <div className="w-10 h-10 rounded-full bg-[var(--secondary)]/40" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-[var(--secondary)]/40" />
              <div className="h-3 w-2/3 rounded bg-[var(--secondary)]/40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
        <span className="text-5xl mb-4">📋</span>
        <p className="text-lg font-medium">제어 이력이 없습니다</p>
        <p className="text-sm mt-1">기기를 제어하면 이력이 여기에 표시됩니다</p>
      </div>
    );
  }

  // 날짜별 그룹핑
  const grouped: Map<string, ControlLogItem[]> = new Map();
  logs.forEach((log) => {
    const { date } = formatDateTime(log.createdAt);
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(log);
  });

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([date, items]) => (
        <div key={date}>
          {/* 날짜 헤더 */}
          <div className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur-sm pb-2 mb-3">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)] bg-[var(--background)] px-3 py-1 rounded-full border border-[var(--secondary)]">
              {date}
            </span>
          </div>

          {/* 타임라인 */}
          <div className="relative pl-8">
            {/* 세로 타임라인 선 */}
            <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-[var(--secondary)]/40" />

            {items.map((log, index) => {
              const { time } = formatDateTime(log.createdAt);
              const icon = DEVICE_ICONS[log.deviceTypeCode ?? ""] ?? "⚡";
              const commandLabel = COMMAND_LABELS[log.command] ?? log.command;
              const paramText = formatParams(log.commandParams);
              const isSuccess = log.result === "SUCCESS";

              return (
                <motion.div
                  key={log.controlLogId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative mb-4 last:mb-0"
                >
                  {/* 타임라인 점 */}
                  <div
                    className={`absolute -left-5 top-3 w-3 h-3 rounded-full border-2 ${
                      isSuccess
                        ? "bg-[var(--accent)] border-[var(--accent)]"
                        : "bg-red-400 border-red-400"
                    }`}
                  />

                  {/* 카드 */}
                  <div className="bg-white rounded-2xl p-4 border border-[var(--secondary)]/30 hover:border-[var(--accent)]/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0">{icon}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--primary)] text-sm truncate">
                            {log.deviceName}
                            <span className="font-normal text-[var(--muted)] ml-2">
                              {commandLabel}
                            </span>
                          </p>
                          <p className="text-xs text-[var(--muted)] mt-0.5">
                            {log.spaceName}
                            <span className="mx-1.5">·</span>
                            {log.spaceType === "PRIVATE" ? "개인" : "공용"}
                            {log.deviceTypeName && (
                              <>
                                <span className="mx-1.5">·</span>
                                {log.deviceTypeName}
                              </>
                            )}
                          </p>
                          {paramText && (
                            <p className="text-xs text-[var(--accent)] mt-1">{paramText}</p>
                          )}
                          {!isSuccess && log.errorMessage && (
                            <p className="text-xs text-red-500 mt-1">⚠ {log.errorMessage}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-xs text-[var(--muted)] font-mono">{time}</span>
                        <span
                          className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSuccess
                              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {isSuccess ? "성공" : "실패"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
