"use client";

import { motion } from "framer-motion";
import type { ControlLogItem } from "../_types";



/* ── 유틸 ── */

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

/** commandParams JSON을 "키: 값" 문자열로 변환 (모든 키 자동 표시) */
function formatParams(params: string | null): string | null {
  if (!params) return null;
  try {
    const obj = JSON.parse(params);
    const parts: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;
      parts.push(`${key}: ${value}`);
    }
    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

/* ── 타입 ── */

interface ControlLogTimelineProps {
  logs: ControlLogItem[];
  isLoading: boolean;
}

/* ── 메인 컴포넌트 ── */

export default function ControlLogTimeline({ logs, isLoading }: ControlLogTimelineProps) {
  // 스켈레톤 로딩
  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-[2rem] border border-border bg-surface p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 rounded-lg bg-muted/30" />
                <div className="h-3 w-2/3 rounded-lg bg-muted/20" />
              </div>
              <div className="w-16 h-6 rounded-xl bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 빈 상태
  if (logs.length === 0) {
    return (
      <div className="rounded-[2rem] border border-border bg-surface p-12 text-center">
        <p className="text-4xl">📋</p>
        <p className="mt-4 text-sm font-semibold text-primary">제어 이력이 없습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">
          기기를 제어하면 이력이 여기에 표시됩니다
        </p>
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
        <section key={date}>
          {/* ── 날짜 헤더 ── */}
          <div className="sticky top-0 z-10 pb-3 mb-1">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground bg-background px-4 py-1.5 rounded-full border border-border shadow-sm">
              {date}
            </span>
          </div>

          {/* ── 로그 카드 리스트 ── */}
          <div className="space-y-2.5">
            {items.map((log, index) => (
              <LogCard key={log.controlLogId} log={log} index={index} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── 로그 카드 (하위 컴포넌트) ── */

function LogCard({ log, index }: { log: ControlLogItem; index: number }) {
  const { time } = formatDateTime(log.createdAt);
  const command = log.commandLabel || log.command;
  const paramText = formatParams(log.commandParams);
  const isSuccess = log.result === "SUCCESS";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group relative rounded-[2rem] border p-5 transition-all duration-200 hover:shadow-md ${
        isSuccess
          ? "border-border bg-surface hover:border-accent/40"
          : "border-red-300/40 bg-red-50/30 hover:border-red-400/60"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* 상태 도트 */}
        <div
          className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1.5 ${
            isSuccess ? "bg-accent" : "bg-red-500"
          }`}
        />

        {/* 본문 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-bold tracking-tight text-primary truncate">
              {log.deviceName}
            </p>
            <span className="text-xs font-mono font-medium text-muted-foreground flex-shrink-0">
              {command}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              {log.spaceType === "PRIVATE" ? "개인" : "공용"}
            </span>
            <span className="text-[10px] text-muted-foreground/50">·</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {log.spaceName}
            </span>
            {log.deviceTypeName && (
              <>
                <span className="text-[10px] text-muted-foreground/50">·</span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {log.deviceTypeName}
                </span>
              </>
            )}
          </div>

          {/* 파라미터 */}
          {paramText && (
            <p className="text-[11px] font-semibold text-accent mt-1.5">
              {paramText}
            </p>
          )}

          {/* 에러 메시지 */}
          {!isSuccess && log.errorMessage && (
            <p className="text-[11px] font-medium text-red-500 mt-1.5">
              ⚠ {log.errorMessage}
            </p>
          )}
        </div>

        {/* 우측: 시간 + 결과 배지 */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-mono font-medium text-muted-foreground">{time}</span>
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isSuccess
                ? "bg-accent/10 text-accent"
                : "bg-red-100 text-red-500"
            }`}
          >
            {isSuccess ? "SUCCESS" : "FAILURE"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
